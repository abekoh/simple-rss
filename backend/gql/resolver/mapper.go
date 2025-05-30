package resolver

import (
	"github.com/abekoh/simple-rss/backend/gql"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
)

func mapSlice[T, U any](xs []T, f func(x T) U) []U {
	ys := make([]U, len(xs))
	for i, x := range xs {
		ys[i] = f(x)
	}
	return ys
}

func mapFeed(x sqlc.Feed) *gql.Feed {
	return &gql.Feed{
		FeedID: x.FeedID,
		URL:    x.Url,
		Title: func() string {
			if x.TitleEditted != nil {
				return *x.TitleEditted
			}
			return x.TitleOriginal
		}(),
		Description:  x.Description,
		RegisteredAt: x.RegisteredAt,
		Idx:          x.Idx,
	}
}

func mapPost(x sqlc.Post) *gql.Post {
	return &gql.Post{
		PostID:        x.PostID,
		FeedID:        x.FeedID,
		URL:           x.Url,
		Title:         x.Title,
		Description:   x.Description,
		Author:        x.Author,
		Status:        gql.PostStatus(x.Status),
		PostedAt:      x.PostedAt,
		LastFetchedAt: x.LastFetchedAt,
	}
}

func mapPostSummary(x sqlc.PostSummary) *gql.PostSummary {
	return &gql.PostSummary{
		PostSummaryID:   x.PostSummaryID,
		PostID:          x.PostID,
		SummarizeMethod: x.SummarizeMethod,
		Summary:         x.Summary,
		SummarizedAt:    x.SummarizedAt,
	}
}

func mapPostFavorite(x sqlc.PostFavorite) *gql.PostFavorite {
	return &gql.PostFavorite{
		PostFavoriteID: x.PostFavoriteID,
		PostID:         x.PostID,
		AddedAt:        x.AddedAt,
	}
}
