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
		FeedID:       x.FeedID,
		URL:          x.Url,
		Title:        x.Title,
		Description:  x.Description,
		RegisteredAt: x.RegisteredAt,
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
