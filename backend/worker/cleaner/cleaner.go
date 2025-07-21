package cleaner

import (
	"context"
	"log/slog"
	"time"

	"github.com/abekoh/simple-rss/backend/lib/database"
)

type Cleaner struct {
	errCh chan<- error
}

func NewCleaner(errCh chan<- error) *Cleaner {
	return &Cleaner{
		errCh: errCh,
	}
}

func (c *Cleaner) CleanupOldPosts(ctx context.Context) {
	slog.Info("cleanup old posts")

	// Delete posts older than 1 month
	threshold := time.Now().AddDate(0, -1, 0)

	deletedCount, err := database.FromContext(ctx).Queries().DeleteOldNonFavoritePosts(ctx, threshold)
	if err != nil {
		slog.Error("failed to cleanup old posts", "error", err)
		c.errCh <- err
		return
	}

	slog.Info("cleanup completed", "deleted_posts", deletedCount)
}
