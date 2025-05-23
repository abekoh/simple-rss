package postfetcher

import (
	"context"
	"fmt"
	"net/http"
	"time"

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

type PostFetcher struct {
	inCh       <-chan Request
	outCh      chan<- Result
	errCh      chan<- error
	httpClient *http.Client
}

func NewPostFetcher(ctx context.Context,
	inCh <-chan Request,
	outCh chan<- Result,
	errCh chan<- error,
	httpClient *http.Client,
) *PostFetcher {
	c := &PostFetcher{
		inCh:       inCh,
		outCh:      outCh,
		errCh:      errCh,
		httpClient: httpClient,
	}
	go c.loop(ctx)
	return c
}

func (pf PostFetcher) loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-pf.inCh:
			res, err := pf.handleRequest(ctx, req)
			if err != nil {
				pf.errCh <- err
				continue
			}
			pf.outCh <- *res
		}
	}
}

var ErrFailedToFetch = fmt.Errorf("failed to fetch")

func (pf PostFetcher) handleRequest(ctx context.Context, req Request) (*Result, error) {
	var (
		fetched       *http.Response
		fetchedAt     time.Time
		fetchedStatus sqlc.PostFetchStatus
	)
	if err := database.Transaction(ctx, func(c context.Context) error {
		queries := database.FromContext(c).Queries()
		post, err := queries.SelectPost(c, req.PostID)
		if err != nil {
			return fmt.Errorf("failed to get post: %w", err)
		}
		if post.Status != sqlc.PostStatusRegistered {
			return nil
		}

		fetchedAt = clock.Now(c)
		fetchedStatus = sqlc.PostFetchStatusSuccess
		var fetchMessage *string

		f, err := pf.httpClient.Get(post.Url)
		if err != nil {
			fetchedStatus = sqlc.PostFetchStatusFailure
			fetchMessage = lo.ToPtr(err.Error())
		} else {
			fetched = f
			if fetched.StatusCode != http.StatusOK {
				fetchedStatus = sqlc.PostFetchStatusFailure
				fetchMessage = lo.ToPtr(fmt.Sprintf("status code: %d", fetched.StatusCode))
			}
		}
		if err := queries.InsertPostFetch(c, sqlc.InsertPostFetchParams{
			PostFetchID: uid.NewUUID(c),
			PostID:      req.PostID,
			Status:      fetchedStatus,
			Message:     fetchMessage,
			FetchedAt:   fetchedAt,
		}); err != nil {
			return fmt.Errorf("failed to insert post fetch: %w", err)
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("transaction failed: %w", err)
	}

	if fetchedStatus == sqlc.PostFetchStatusFailure {
		return nil, ErrFailedToFetch
	}

	if err := database.Transaction(ctx, func(c context.Context) error {
		queries := database.FromContext(c).Queries()
		post, err := queries.SelectPostForUpdate(c, req.PostID)
		if err != nil {
			return fmt.Errorf("failed to get post: %w", err)
		}

		parsedHTML, err := goquery.NewDocumentFromReader(fetched.Body)
		if err != nil {
			return nil
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

		if err := queries.UpdatePost(c, sqlc.UpdatePostParams{
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
		return nil
	}); err != nil {
		return nil, fmt.Errorf("transaction failed")
	}

	return &Result{
		PostID: req.PostID,
	}, nil
}
