package summarizer

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"slices"
	"strings"

	"github.com/PuerkitoBio/goquery"
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
	inCh           <-chan Request
	outCh          chan<- Result
	errCh          chan<- error
	httpClient     *http.Client
	geminiClient   *genai.Client
	summarizeModel string
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
	s.summarizeModel = "gemini-2.0-flash-lite"
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

		feed, err := database.FromContext(ctx).Queries().SelectFeed(ctx, post.FeedID)
		if err != nil {
			return fmt.Errorf("failed to get feed: %w", err)
		}

		var summarized string
		switch {
		case slices.Contains(feed.Tags, "hnrss"):
			sum, err := s.summarize(ctx, post.Url)
			if err != nil {
				return fmt.Errorf("failed to summarize: %w", err)
			}
			if post.Description != nil {
				commentsUrl, err := getCommentLinkFromHNRSS(*post.Description)
				if err == nil {
					commentsSum, err := s.summarize(ctx, commentsUrl)
					if err != nil {
						return fmt.Errorf("failed to summarize comments: %w", err)
					}
					summarized = fmt.Sprintf(`## 元記事
%s
## Comments from Hacker News
%s
`, sum, commentsSum)
				}
			}
		default:
			sum, err := s.summarize(ctx, post.Url)
			if err != nil {
				return fmt.Errorf("failed to summarize: %w", err)
			}
			summarized = sum
		}

		summarizedAt := clock.Now(ctx)

		if err := database.FromContext(ctx).Queries().InsertPostSummary(ctx, sqlc.InsertPostSummaryParams{
			PostSummaryID:   postSummaryID,
			PostID:          post.PostID,
			SummarizeMethod: s.summarizeModel,
			Summary:         summarized,
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

type summarizeOption struct {
	prompt string
}

func newSummarizeOption() summarizeOption {
	return summarizeOption{
		prompt: `Summarize this page in Japanese. 
Result must be format in markdown.
Do not include the title of the page, just the content.
Maximum number of lines is about 30.
Maximum header is up to h2.
The maximum number of lines is about 30.
DO NOT SURROUND THE CONTENT WITH ` + "```" + `, REPLY ONLY THE MARKDOWN CONTENT.`,
	}
}

func (s Summarizer) summarize(ctx context.Context, url string, opts ...func(option *summarizeOption)) (string, error) {
	o := newSummarizeOption()
	for _, opt := range opts {
		opt(&o)
	}

	fetched, err := s.httpClient.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to fetch: %w", err)
	}
	if fetched.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch: %w", err)
	}
	defer fetched.Body.Close()
	body, err := io.ReadAll(fetched.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read body: %w", err)
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
		genai.NewPartFromText(o.prompt),
	}
	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}
	geminiRes, err := s.geminiClient.Models.GenerateContent(
		ctx,
		s.summarizeModel,
		contents,
		nil,
	)
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}
	return geminiRes.Text(), nil
}

func getCommentLinkFromHNRSS(desc string) (string, error) {
	parsedHTML, err := goquery.NewDocumentFromReader(strings.NewReader(desc))
	if err != nil {
		return "", fmt.Errorf("failed to parse HTML: %w", err)
	}
	link, ok := parsedHTML.Find("a").Last().Attr("href")
	if !ok {
		return "", fmt.Errorf("failed to get comment link")
	}
	return link, nil
}
