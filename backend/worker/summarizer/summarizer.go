package summarizer

import (
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/config"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
	"google.golang.org/genai"
)

type (
	Request struct {
		PostID string
	}
	Result struct {
		PostID        string
		PostSummaryID string
	}
)

type Summarizer struct {
	inCh         <-chan Request
	outCh        chan<- Result
	errCh        chan<- error
	httpClient   *http.Client
	geminiClient *genai.Client
}

func NewSummarizer(
	ctx context.Context,
	inCh <-chan Request,
	outCh chan<- Result,
	errCh chan<- error,
	httpClient *http.Client,
) (*Summarizer, error) {
	geminiClient, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.FromContext(ctx).GeminiAPIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}
	s := Summarizer{
		inCh:         inCh,
		outCh:        outCh,
		errCh:        errCh,
		httpClient:   httpClient,
		geminiClient: geminiClient,
	}
	go s.loop(ctx)
	return &s, nil
}

func (s Summarizer) loop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-s.inCh:
			res, err := s.handleRequest(ctx, req)
			if err != nil {
				s.errCh <- err
				continue
			}
			s.outCh <- *res
		}
	}
}

func (s Summarizer) handleRequest(ctx context.Context, req Request) (*Result, error) {
	postSummaryID := uid.NewUUID(ctx)
	if err := database.Transaction(ctx, func(c context.Context) error {
		post, err := database.FromContext(ctx).Queries().SelectPostForUpdate(ctx, req.PostID)
		if err != nil {
			return fmt.Errorf("failed to get post: %w", err)
		}
		if post.Status == sqlc.PostStatusSummarized {
			return nil
		}
		fetched, err := s.httpClient.Get(post.Url)
		if err != nil {
			return fmt.Errorf("failed to fetch: %w", err)
		}
		if fetched.StatusCode != http.StatusOK {
			return fmt.Errorf("failed to fetch: %w", err)
		}
		defer fetched.Body.Close()
		body, err := io.ReadAll(fetched.Body)
		if err != nil {
			return fmt.Errorf("failed to read body: %w", err)
		}

		contentType := fetched.Header.Get("Content-Type")
		if len(contentType) == 0 {
			contentType = "text/html"
		}

		parts := []*genai.Part{
			{
				InlineData: &genai.Blob{
					MIMEType: contentType,
					Data:     body,
				},
			},
			genai.NewPartFromText("Summarize this page in Japanese"),
		}
		contents := []*genai.Content{
			genai.NewContentFromParts(parts, genai.RoleUser),
		}
		summarizedAt := clock.Now(ctx)
		const summarizeModel = "gemini-2.0-flash-lite"
		geminiRes, err := s.geminiClient.Models.GenerateContent(
			ctx,
			summarizeModel,
			contents,
			nil,
		)
		if err != nil {
			return fmt.Errorf("failed to generate content: %w", err)
		}
		if err := database.FromContext(ctx).Queries().InsertPostSummary(ctx, sqlc.InsertPostSummaryParams{
			PostSummaryID:   postSummaryID,
			PostID:          post.PostID,
			SummarizeMethod: summarizeModel,
			Summary:         geminiRes.Text(),
			SummarizedAt:    summarizedAt,
		}); err != nil {
			return fmt.Errorf("failed to update post: %w", err)
		}
		if err := database.FromContext(ctx).Queries().UpdatePost(ctx, sqlc.UpdatePostParams{
			Title:         post.Title,
			Description:   post.Description,
			Author:        post.Author,
			Url:           post.Url,
			PostedAt:      post.PostedAt,
			LastFetchedAt: post.LastFetchedAt,
			Status:        sqlc.PostStatusSummarized,
			PostID:        post.PostID,
		}); err != nil {
			return fmt.Errorf("failed to update post: %w", err)
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	return &Result{
		PostID:        req.PostID,
		PostSummaryID: postSummaryID,
	}, nil
}
