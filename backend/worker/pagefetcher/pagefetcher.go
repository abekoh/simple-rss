package pagefetcher

import (
	"context"
	"fmt"
	"net/http"

	"github.com/PuerkitoBio/goquery"
	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/samber/lo"
)

type (
	Request struct {
		PostID string
	}
	Result struct {
		PostID string
	}
)

type PageFetcher struct {
	inCh  <-chan Request
	outCh chan<- Result
	errCh chan<- error
}

func NewPageFetcher(ctx context.Context,
	inCh <-chan Request,
	outCh chan<- Result,
	errCh chan<- error,
) *PageFetcher {
	c := &PageFetcher{
		inCh:  inCh,
		outCh: outCh,
		errCh: errCh,
	}
	go c.Loop(ctx)
	return c
}

func (c PageFetcher) Loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-c.inCh:
			res, err := handleRequest(ctx, req)
			if err != nil {
				c.errCh <- err
			}
			c.outCh <- *res
		}
	}
}

func handleRequest(ctx context.Context, req Request) (*Result, error) {
	if err := database.Transaction(ctx, func(c context.Context) error {
		queries := database.FromContext(ctx).Queries()
		post, err := queries.SelectPost(ctx, req.PostID)
		if err != nil {
			return fmt.Errorf("failed to get post: %w", err)
		}
		if post.Status != sqlc.PostStatusRegistered {
			return nil
		}
		fetchedAt := clock.Now(ctx)
		fetched, err := http.Get(post.Url)
		if err != nil {
			return fmt.Errorf("failed to fetch page: %w", err)
		}
		if fetched.StatusCode != http.StatusOK {
			return fmt.Errorf("failed to fetch page: %w", err)
		}

		parsedHTML, err := goquery.NewDocumentFromReader(fetched.Body)
		if err != nil {
			return fmt.Errorf("failed to parse html: %w", err)
		}

		fetchedTitle := parsedHTML.Find("title").Text()
		updatedTitle := post.Title
		if fetchedTitle != "" {
			updatedTitle = fetchedTitle
		}

		fetchedDescription := parsedHTML.Find("meta[name=description]").AttrOr("content", "")
		updatedDescription := post.Description
		if fetchedDescription != "" {
			updatedDescription = &fetchedDescription
		}

		fetchedAuthor := parsedHTML.Find("meta[name=author]").AttrOr("content", "")
		updatedAuthor := post.Author
		if fetchedAuthor != "" {
			updatedAuthor = &fetchedAuthor
		}

		if err := queries.UpdatePost(ctx, sqlc.UpdatePostParams{
			Title:         updatedTitle,
			Description:   updatedDescription,
			Author:        updatedAuthor,
			Url:           post.Url,
			PostedAt:      post.PostedAt,
			LastFetchedAt: lo.ToPtr(fetchedAt),
			Status:        sqlc.PostStatusFetched,
			PostID:        post.PostID,
		}); err != nil {
			return fmt.Errorf("failed to update post: %w", err)
		}
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}
	return &Result{
		PostID: req.PostID,
	}, nil
}
