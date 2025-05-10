package feedfetcher

import (
	"context"

	"github.com/mmcdole/gofeed"
)

type (
	Request struct {
		URL string
	}

	requestWithResultCh struct {
		Request
		ResultCh chan *Result
	}

	Result struct {
		Success bool
		Content *gofeed.Feed
		Error   error
	}
)

type FeedFetcher struct {
	feedParser *gofeed.Parser
	requestCh  chan *requestWithResultCh
}

func NewFeedFetcher(ctx context.Context) *FeedFetcher {
	c := &FeedFetcher{
		feedParser: gofeed.NewParser(),
		requestCh:  make(chan *requestWithResultCh, 10),
	}
	go c.Loop(ctx)
	return c
}

func (c FeedFetcher) Loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-c.requestCh:
			feedContent, err := c.feedParser.ParseURL(req.URL)
			if err != nil {
				req.ResultCh <- &Result{
					Success: false,
					Error:   err,
				}
				continue
			}
			req.ResultCh <- &Result{
				Success: true,
				Content: feedContent,
			}
		}
	}
}

func (c FeedFetcher) SendRequestSync(req Request) (*Result, error) {
	resCh := make(chan *Result)
	c.requestCh <- &requestWithResultCh{
		Request:  req,
		ResultCh: resCh,
	}
	return <-resCh, nil
}

var DefaultFeedFetcher *FeedFetcher

func SendRequestSync(req Request) (*Result, error) {
	return DefaultFeedFetcher.SendRequestSync(req)
}
