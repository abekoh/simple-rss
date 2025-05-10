package resolver

import (
	"github.com/abekoh/simple-rss/backend/worker/feedfetcher"
	"github.com/abekoh/simple-rss/backend/worker/postfetcher"
	"github.com/abekoh/simple-rss/backend/worker/summarizer"
)

type Resolver struct {
	feedFetcher *feedfetcher.FeedFetcher
	postFetcher *postfetcher.PostFetcher
	sum         *summarizer.Summarizer
}

func NewResolver(
	feedFetcher *feedfetcher.FeedFetcher,
	postFetcher *postfetcher.PostFetcher,
	sum *summarizer.Summarizer,
) *Resolver {
	return &Resolver{
		feedFetcher: feedFetcher,
		postFetcher: postFetcher,
		sum:         sum,
	}
}
