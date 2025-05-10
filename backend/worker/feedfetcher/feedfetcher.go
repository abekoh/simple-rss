package feedfetcher

import (
	"context"
	"fmt"

	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/worker/pagefetcher"
	"github.com/mmcdole/gofeed"
)

type Request struct {
	FeedID   string
	NotifyCh chan<- bool
}

type FeedFetcher struct {
	feedParser *gofeed.Parser
	inCh       <-chan Request
	outCh      chan<- pagefetcher.Request
	errCh      chan<- error
}

func NewFeedFetcher(
	ctx context.Context,
	inCh <-chan Request,
	outCh chan<- pagefetcher.Request,
	errCh chan<- error,
) *FeedFetcher {
	c := &FeedFetcher{
		feedParser: gofeed.NewParser(),
		inCh:       inCh,
		outCh:      outCh,
		errCh:      errCh,
	}
	go c.Loop(ctx)
	return c
}

func (c FeedFetcher) Loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-c.inCh:
			queries := database.FromContext(ctx).Queries()
			feedRow, err := queries.SelectFeed(ctx, req.FeedID)
			if err != nil {
				c.errCh <- fmt.Errorf("failed to get feed: %w", err)
				continue
			}
			feedParsed, err := c.feedParser.ParseURL(feedRow.Url)
			if err != nil {
				c.errCh <- fmt.Errorf("failed to parse feed: %w", err)
				continue
			}
			for _, _ = range feedParsed.Items {
				// TODO
			}
		}
	}
}
