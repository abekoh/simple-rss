package scheduler

import (
	"context"
	"log/slog"
	"time"

	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/worker/cleaner"
	"github.com/abekoh/simple-rss/backend/worker/feedfetcher"
	"github.com/abekoh/simple-rss/backend/worker/postfetcher"
)

type Scheduler struct {
	feedFetcher *feedfetcher.FeedFetcher
	postFetcher *postfetcher.PostFetcher
	cleaner     *cleaner.Cleaner
	errCh       chan<- error
}

func NewScheduler(
	ctx context.Context,
	feedFetcher *feedfetcher.FeedFetcher,
	postFetcher *postfetcher.PostFetcher,
	cleaner *cleaner.Cleaner,
	errCh chan<- error,
) *Scheduler {
	s := Scheduler{
		feedFetcher: feedFetcher,
		postFetcher: postFetcher,
		cleaner:     cleaner,
		errCh:       errCh,
	}
	go s.loop(ctx)
	return &s
}

func (s Scheduler) loop(ctx context.Context) {
	s.fetchFeeds(ctx)
	s.cleanupOldPosts(ctx)

	fetchFeedsTick := time.NewTicker(time.Minute * 5)
	cleanupTick := time.NewTicker(time.Hour)

	for {
		select {
		case <-ctx.Done():
			return
		case <-fetchFeedsTick.C:
			s.fetchFeeds(ctx)
		case <-cleanupTick.C:
			s.cleanupOldPosts(ctx)
		}
	}
}

func (s Scheduler) fetchFeeds(ctx context.Context) {
	slog.Info("fetch feeds")
	threshold := time.Now().Add(-1 * time.Hour)
	feeds, err := database.FromContext(ctx).Queries().SelectRecentlyNotFetchedFeeds(ctx, threshold)
	if err != nil {
		s.errCh <- err
		return
	}
	for _, feed := range feeds {
		s.feedFetcher.Request(ctx, feedfetcher.Request{
			FeedID: feed.FeedID,
		})
	}
}

func (s Scheduler) cleanupOldPosts(ctx context.Context) {
	s.cleaner.CleanupOldPosts(ctx)
}
