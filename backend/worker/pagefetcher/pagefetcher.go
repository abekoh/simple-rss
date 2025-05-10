package pagefetcher

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
	"github.com/jackc/pgconn"
	"github.com/mmcdole/gofeed"
)

type (
	Request struct {
		FeedID   string
		FeedItem *gofeed.Item
	}

	Result struct {
		Success bool
		Body    string
		Error   error
	}
)

type PageFetcher struct {
	requestCh chan Request
}

func NewPageFetcher(ctx context.Context) *PageFetcher {
	c := &PageFetcher{
		requestCh: make(chan Request, 10),
	}
	go c.Loop(ctx)
	return c
}

func (c PageFetcher) Loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-c.requestCh:
			err := c.handleRequest(ctx, req)
			if err != nil {
				slog.Error("failed to handle request", slog.Any("request", req))
			} else {
				slog.Info("success to handle request", slog.Any("request", req))
			}
		}
	}
}

func (c PageFetcher) handleRequest(ctx context.Context, req Request) error {
	if req.FeedItem.Link == "" {
		return fmt.Errorf("failed to get link")
	}
	if err := database.Transaction(ctx, func(c context.Context) error {
		queries := database.FromContext(ctx).Queries()
		found := false
		_, err := queries.SelectPostByURL(ctx, req.FeedItem.Link)
		if err != nil {
			var pgErr *pgconn.PgError
			// TODO not foundの場合はスルー
			if errors.As(err, &pgErr) && pgErr.Code == "" {
				found = true
			} else {
				return err
			}
		}
		if found {
			return nil
		}
		crawlID := uid.NewUUID(ctx)
		postID := uid.NewUUID(ctx)
		crawledAt := clock.Now(ctx)
		if err := queries.InsertCrawl(ctx, sqlc.InsertCrawlParams{
			CrawlID:   crawlID,
			FeedID:    req.FeedID,
			Status:    sqlc.CrawlStatusSuccess,
			Message:   nil,
			CrawledAt: crawledAt,
		}); err != nil {
			return err
		}
		if err := queries.InsertPost(ctx, sqlc.InsertPostParams{
			PostID:  postID,
			FeedID:  req.FeedID,
			CrawlID: crawlID,
			Title:   req.FeedItem.Title,
			Author: func() *string {
				if req.FeedItem.Author == nil {
					return nil
				}
				if req.FeedItem.Author.Name == "" {
					return nil
				}
				return &req.FeedItem.Author.Name
			}(),
			Url: req.FeedItem.Link,
			SummaryOriginal: func() *string {
				if req.FeedItem.Description == "" {
					return nil
				}
				return &req.FeedItem.Description
			}(),
			PostedAt: *req.FeedItem.PublishedParsed,
		}); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}
	return nil
}

func (c PageFetcher) SendRequest(ctx context.Context, req Request) error {
	c.requestCh <- req
	return nil
}

var DefaultPageFetcher *PageFetcher

func SendRequest(ctx context.Context, req Request) error {
	return DefaultPageFetcher.SendRequest(ctx, req)
}
