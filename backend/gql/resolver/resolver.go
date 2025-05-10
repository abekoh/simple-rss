package resolver

import (
	"github.com/abekoh/simple-rss/backend/worker/feedfetcher"
	"github.com/abekoh/simple-rss/backend/worker/postfetcher"
)

type Resolver struct {
	feedFetcher *feedfetcher.FeedFetcher
	postFetcher *postfetcher.PostFetcher
}

func NewResolver(
	feedFetcher *feedfetcher.FeedFetcher,
	postFetcher *postfetcher.PostFetcher,
) *Resolver {
	return &Resolver{
		feedFetcher: feedFetcher,
		postFetcher: postFetcher,
	}
}
