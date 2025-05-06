package service

import (
	"context"

	"github.com/abekoh/simple-rss/backend/domain/model/feed"
	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
)

type (
	CreateFeedInput struct {
		URL         string
		Title       string
		Description *string
	}
	CreateFeedOutput struct {
		NewFeed *feed.Feed
	}
)

func CreateFeed(ctx context.Context, input CreateFeedInput) (*CreateFeedOutput, error) {
	newFeed := &feed.Feed{
		FeedID:       uid.NewUUID(ctx),
		URL:          input.URL,
		Title:        input.Title,
		Description:  input.Description,
		RegisteredAt: clock.Now(ctx),
	}

	db := database.FromContext(ctx)
	if err := db.Queries().InsertFeed(ctx, sqlc.InsertFeedParams{
		FeedID:       newFeed.FeedID,
		Url:          newFeed.URL,
		Title:        newFeed.Title,
		Description:  newFeed.Description,
		RegisteredAt: newFeed.RegisteredAt,
	}); err != nil {
		return nil, err
	}
	return &CreateFeedOutput{
		NewFeed: newFeed,
	}, nil
}
