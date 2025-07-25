package resolver

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.76

import (
	"context"
	"fmt"

	"github.com/abekoh/simple-rss/backend/gql"
	"github.com/abekoh/simple-rss/backend/lib/clock"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/abekoh/simple-rss/backend/lib/uid"
	"github.com/abekoh/simple-rss/backend/worker/feedfetcher"
	"github.com/mmcdole/gofeed"
)

// RegisterFeed is the resolver for the registerFeed field.
func (r *mutationResolver) RegisterFeed(ctx context.Context, input gql.RegisterFeedInput) (*gql.RegisterFeedPayload, error) {
	feedURLs, err := detectFeedURLs(ctx, input.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to find feed url: %w", err)
	}

	feedContentSet := make(map[string]gofeed.Feed, len(feedURLs))
	fp := gofeed.NewParser()
	for _, feedURL := range feedURLs {
		feedContent, err := fp.ParseURL(feedURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse url: %w", err)
		}
		feedContentSet[feedURL] = *feedContent
	}

	newFeedIDs := make([]string, 0, len(feedContentSet))
	if err := database.Transaction(ctx, func(c context.Context) error {
		for feedURL, feedContent := range feedContentSet {
			newFeedID := uid.NewUUID(ctx)
			newFeedIDs = append(newFeedIDs, newFeedID)
			if err := database.FromContext(ctx).Queries().InsertFeed(ctx, sqlc.InsertFeedParams{
				FeedID:        newFeedID,
				Url:           feedURL,
				TitleOriginal: feedContent.Title,
				Description: func() *string {
					if feedContent.Description == "" {
						return nil
					}
					return &feedContent.Description
				}(),
				RegisteredAt: clock.Now(ctx),
			}); err != nil {
				return fmt.Errorf("failed to insert feed: %w", err)
			}
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}

	for _, newFeedID := range newFeedIDs {
		r.feedFetcher.Request(ctx, feedfetcher.Request{
			FeedID: newFeedID,
		})
	}

	return &gql.RegisterFeedPayload{
		FeedIds: newFeedIDs,
	}, nil
}

// RenameFeedTitle is the resolver for the renameFeedTitle field.
func (r *mutationResolver) RenameFeedTitle(ctx context.Context, input gql.RenameFeedTitleInput) (*gql.RenameFeedTitlePayload, error) {
	if len([]rune(input.NewTitle)) > 50 {
		return nil, fmt.Errorf("title must be less than 50 characters")
	}
	if err := database.Transaction(ctx, func(c context.Context) error {
		if err := database.FromContext(ctx).
			Queries().UpdateFeedTitle(ctx, sqlc.UpdateFeedTitleParams{
			FeedID:       input.FeedID,
			TitleEditted: &input.NewTitle,
		}); err != nil {
			return fmt.Errorf("failed to update feed title: %w", err)
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}
	return &gql.RenameFeedTitlePayload{
		FeedID: input.FeedID,
	}, nil
}

// DeleteFeed is the resolver for the deleteFeed field.
func (r *mutationResolver) DeleteFeed(ctx context.Context, input gql.DeleteFeedInput) (*gql.DeleteFeedPayload, error) {
	if err := database.Transaction(ctx, func(c context.Context) error {
		if _, err := database.FromContext(ctx).Queries().SelectFeed(ctx, input.FeedID); err != nil {
			return fmt.Errorf("failed to select feed: %w", err)
		}
		if err := database.FromContext(ctx).Queries().DeleteFeed(ctx, input.FeedID); err != nil {
			return fmt.Errorf("failed to delete feed: %w", err)
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}
	return &gql.DeleteFeedPayload{
		FeedID: input.FeedID,
	}, nil
}

// RearrangeFeed is the resolver for the rearrangeFeed field.
func (r *mutationResolver) RearrangeFeed(ctx context.Context, input gql.RearrangeFeedInput) (*gql.RearrangeFeedPayload, error) {
	if err := database.Transaction(ctx, func(c context.Context) error {
		// 1. 対象のフィードを取得（FOR UPDATE）
		feed, err := database.FromContext(c).Queries().SelectFeedForUpdate(c, input.FeedID)
		if err != nil {
			return fmt.Errorf("failed to select feed: %w", err)
		}

		// 2. 現在のインデックスと新しいインデックスが同じ場合は何もしない
		if feed.Idx == int32(input.NewIndex) {
			return nil
		}

		if feed.Idx < 1 {
			return fmt.Errorf("invalid index: %d", input.NewIndex)
		}

		// 3. 最大インデックスを取得して、新しいインデックスが範囲内かチェック
		maxIdx, err := database.FromContext(c).Queries().SelectFeedMaxIdx(c)
		if err != nil {
			return fmt.Errorf("failed to get max index: %w", err)
		}

		// 新しいインデックスが最大値を超えていないかチェック
		if int32(input.NewIndex) > maxIdx {
			return fmt.Errorf("new index exceeds maximum index: %d", maxIdx)
		}

		// 4. インデックスの移動方向に応じて、影響を受けるフィードのインデックスを調整
		if feed.Idx > int32(input.NewIndex) {
			// 現在位置より前に移動する場合（例：5→3）
			// 新しい位置から現在位置の前までのインデックスをインクリメント
			if err := database.FromContext(c).Queries().UpdateFeedIdxesIncrement(c, sqlc.UpdateFeedIdxesIncrementParams{
				IdxFrom: int32(input.NewIndex),
				IdxTo:   feed.Idx - 1,
			}); err != nil {
				return fmt.Errorf("failed to increment indexes: %w", err)
			}
		} else {
			// 現在位置より後ろに移動する場合（例：3→5）
			// 現在位置の次から新しい位置までのインデックスをデクリメント
			if err := database.FromContext(c).Queries().UpdateFeedIdxesDecrement(c, sqlc.UpdateFeedIdxesDecrementParams{
				IdxFrom: feed.Idx + 1,
				IdxTo:   int32(input.NewIndex),
			}); err != nil {
				return fmt.Errorf("failed to decrement indexes: %w", err)
			}
		}

		// 5. 対象のフィードのインデックスを更新
		if err := database.FromContext(c).Queries().UpdateFeedIdx(c, sqlc.UpdateFeedIdxParams{
			FeedID: input.FeedID,
			Idx:    int32(input.NewIndex),
		}); err != nil {
			return fmt.Errorf("failed to update feed index: %w", err)
		}

		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}

	return &gql.RearrangeFeedPayload{
		FeedID: input.FeedID,
	}, nil
}

// AddPostFavorite is the resolver for the addPostFavorite field.
func (r *mutationResolver) AddPostFavorite(ctx context.Context, input gql.AddPostFavoriteInput) (*gql.AddPostFavoritePayload, error) {
	postFavoriteID := uid.NewUUID(ctx)
	if err := database.Transaction(ctx, func(c context.Context) error {
		if err := database.FromContext(ctx).Queries().InsertPostFavorite(ctx, sqlc.InsertPostFavoriteParams{
			PostFavoriteID: postFavoriteID,
			PostID:         input.PostID,
			AddedAt:        clock.Now(ctx),
		}); err != nil {
			return fmt.Errorf("failed to insert post favorite: %w", err)
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}
	return &gql.AddPostFavoritePayload{
		PostID:         input.PostID,
		PostFavoriteID: postFavoriteID,
	}, nil
}

// RemovePostFavorite is the resolver for the removePostFavorite field.
func (r *mutationResolver) RemovePostFavorite(ctx context.Context, input gql.RemovePostFavoriteInput) (*gql.RemovePostFavoritePayload, error) {
	if err := database.Transaction(ctx, func(c context.Context) error {
		if _, err := database.FromContext(ctx).Queries().SelectPostFavorite(ctx, input.PostFavoriteID); err != nil {
			return fmt.Errorf("failed to select post favorite: %w", err)
		}
		if err := database.FromContext(ctx).Queries().DeletePostFavorite(ctx, input.PostFavoriteID); err != nil {
			return fmt.Errorf("failed to delete post favorite: %w", err)
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed in transaction: %w", err)
	}
	return &gql.RemovePostFavoritePayload{
		PostFavoriteID: input.PostFavoriteID,
	}, nil
}

// Mutation returns gql.MutationResolver implementation.
func (r *Resolver) Mutation() gql.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
