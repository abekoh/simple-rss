package pagefetcher

import (
	"context"
	"fmt"
	"net/http"

	"github.com/PuerkitoBio/goquery"
	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
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

var ErrFailedToFetch = fmt.Errorf("failed to fetch")

func handleRequest(ctx context.Context, req Request) (*Result, error) {
	queries := database.FromContext(ctx).Queries()
	post, err := queries.SelectPost(ctx, req.PostID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post.Status != sqlc.PostStatusRegistered {
		return nil, nil
	}

	fetchedAt := clock.Now(ctx)
	fetchedStatus := sqlc.PostFetchStatusSuccess
	var fetchMessage *string

	fetched, err := http.Get(post.Url)
	if err != nil {
		fetchedStatus = sqlc.PostFetchStatusFailure
		fetchMessage = lo.ToPtr(err.Error())
	} else {
		if fetched.StatusCode != http.StatusOK {
			fetchedStatus = sqlc.PostFetchStatusFailure
			fetchMessage = lo.ToPtr(fmt.Sprintf("status code: %d", fetched.StatusCode))
		}
	}
	if err := queries.InsertPostFetch(ctx, sqlc.InsertPostFetchParams{
		PostFetchID: uid.NewUUID(ctx),
		PostID:      req.PostID,
		Status:      fetchedStatus,
		Message:     fetchMessage,
		FetchedAt:   fetchedAt,
	}); err != nil {
		return nil, fmt.Errorf("failed to insert post fetch: %w", err)
	}

	if fetchedStatus == sqlc.PostFetchStatusFailure {
		return nil, ErrFailedToFetch
	}

	parsedHTML, err := goquery.NewDocumentFromReader(fetched.Body)
	if err != nil {
		return nil, nil
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
		return nil, fmt.Errorf("failed to update post: %w", err)
	}

	return &Result{
		PostID: req.PostID,
	}, nil
}
