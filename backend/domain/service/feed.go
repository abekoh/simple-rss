package service

import (
	"context"

	"github.com/abekoh/simple-rss/backend/domain/model/feed"
	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
	"github.com/mmcdole/gofeed"
)

type (
	RegisterFeedInput struct {
		URL string
	}
	RegisterFeedOutput struct {
		NewFeed *feed.Feed
	}
)

func RegisterFeed(ctx context.Context, input RegisterFeedInput) (*RegisterFeedOutput, error) {
	fp := gofeed.NewParser()
	feedContent, err := fp.ParseURL(input.URL)
	if err != nil {
		return nil, err
	}

	newFeed := &feed.Feed{
		FeedID: uid.NewUUID(ctx),
		URL:    input.URL,
		Title:  feedContent.Title,
		Description: func() *string {
			if feedContent.Description == "" {
				return nil
			}
			return &feedContent.Description
		}(),
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
	return &RegisterFeedOutput{
		NewFeed: newFeed,
	}, nil
}
