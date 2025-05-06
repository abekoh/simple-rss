package crawler

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

type Crawler struct {
	feedParser *gofeed.Parser
	requestCh  chan *requestWithResultCh
}

func NewCrawler(ctx context.Context) *Crawler {
	c := &Crawler{
		feedParser: gofeed.NewParser(),
		requestCh:  make(chan *requestWithResultCh, 10),
	}
	go c.Loop(ctx)
	return c
}

func (c Crawler) Loop(ctx context.Context) {
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

func (c Crawler) SendRequest(req Request) (*Result, error) {
	resCh := make(chan *Result)
	c.requestCh <- &requestWithResultCh{
		Request:  req,
		ResultCh: resCh,
	}
	return <-resCh, nil
}

var (
	DefaultCrawler = NewCrawler(context.Background())
)

func SendRequest(req Request) (*Result, error) {
	return DefaultCrawler.SendRequest(req)
}
