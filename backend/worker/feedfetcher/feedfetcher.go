package feedfetcher

import (
	"context"
	"errors"
	"fmt"

	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/mmcdole/gofeed"
	"github.com/samber/lo"
)

type (
	Request struct {
		FeedID string
	}
	Result struct {
		FeedID string
		PostID string
	}
)

type FeedFetcher struct {
	feedParser *gofeed.Parser
	inCh       chan Request
	outCh      chan<- Result
	errCh      chan<- error
}

func NewFeedFetcher(
	ctx context.Context,
	inCh chan Request,
	outCh chan<- Result,
	errCh chan<- error,
) *FeedFetcher {
	c := &FeedFetcher{
		feedParser: gofeed.NewParser(),
		inCh:       inCh,
		outCh:      outCh,
		errCh:      errCh,
	}
	go c.loop(ctx)
	return c
}

func (ff FeedFetcher) loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-ff.inCh:
			ff.handleRequest(ctx, req)
		}
	}
}

func (ff FeedFetcher) handleRequest(ctx context.Context, req Request) {
	feedRow, err := database.FromContext(ctx).Queries().SelectFeedForUpdate(ctx, req.FeedID)
	if err != nil {
		ff.errCh <- fmt.Errorf("failed to get feed: %w", err)
		return
	}
	feedParsed, err := ff.feedParser.ParseURL(feedRow.Url)
	if err != nil {
		ff.errCh <- fmt.Errorf("failed to parse feed: %w", err)
		return
	}
	for _, item := range feedParsed.Items {
		postID := uid.NewUUID(ctx)
		if err := database.FromContext(ctx).Queries().InsertPost(ctx, sqlc.InsertPostParams{
			PostID:      postID,
			FeedID:      req.FeedID,
			Title:       item.Title,
			Description: lo.ToPtr(item.Description),
			Author: func() *string {
				if len(item.Authors) == 0 {
					return nil
				}
				return &item.Authors[0].Name
			}(),
			Url:      item.Link,
			PostedAt: item.PublishedParsed,
			Status:   sqlc.PostStatusRegistered,
		}); err != nil {
			var pgError *pgconn.PgError
			// skip if duplicate key error
			if errors.As(err, &pgError) && pgError.Code == "23505" {
				continue
			}
			ff.errCh <- fmt.Errorf("failed to insert post: %w", err)
			continue
		}
		ff.outCh <- Result{
			FeedID: req.FeedID,
			PostID: postID,
		}
	}
}

func (ff FeedFetcher) Request(_ context.Context, req Request) {
	ff.inCh <- req
}
