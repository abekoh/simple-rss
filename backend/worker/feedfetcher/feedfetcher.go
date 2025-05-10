package feedfetcher

import (
	"context"
	"errors"
	"fmt"

	"github.com/abekoh/simple-rss/backend/lib/clock"
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
	var (
		fetchFeedStatus  sqlc.FeedFetchStatus
		fetchFeedMessage *string
		feedParsed       *gofeed.Feed
	)
	if err := database.Transaction(ctx, func(c context.Context) error {
		feedRow, err := database.FromContext(ctx).Queries().SelectFeedForUpdate(ctx, req.FeedID)
		if err != nil {
			return fmt.Errorf("failed to get feed: %w", err)
		}
		fetchedAt := clock.Now(ctx)
		fp, err := ff.feedParser.ParseURL(feedRow.Url)
		if err != nil {
			fetchFeedStatus = sqlc.FeedFetchStatusFailure
			fetchFeedMessage = lo.ToPtr(err.Error())
		} else {
			fetchFeedStatus = sqlc.FeedFetchStatusSuccess
			feedParsed = fp
		}
		if err := database.FromContext(ctx).Queries().InsertFeedFetch(ctx, sqlc.InsertFeedFetchParams{
			FeedFetchID: uid.NewUUID(ctx),
			FeedID:      feedRow.FeedID,
			Status:      fetchFeedStatus,
			Message:     fetchFeedMessage,
			FetchedAt:   fetchedAt,
		}); err != nil {
			return fmt.Errorf("failed to insert feed fetch: %w", err)
		}
		if err := database.FromContext(ctx).Queries().UpdateFeedLastFetchedAt(ctx, fetchedAt); err != nil {
			return fmt.Errorf("failed to update feed: %w", err)
		}
		return nil
	}); err != nil {
		ff.errCh <- err
		return
	}

	if fetchFeedStatus != sqlc.FeedFetchStatusSuccess {
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
