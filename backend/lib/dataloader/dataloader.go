package dataloader

import (
	"context"
	"errors"

	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/keymutex"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/graph-gophers/dataloader/v7"
)

type DataLoader struct {
	keyMutex             *keymutex.KeyMutex
	feed                 *dataloader.Loader[string, sqlc.Feed]
	postSummaryByPostID  *dataloader.Loader[string, sqlc.PostSummary]
	postFavoriteByPostID *dataloader.Loader[string, sqlc.PostFavorite]
}

func New() *DataLoader {
	return &DataLoader{
		keyMutex: keymutex.New(),
	}
}

func (d *DataLoader) Feed(ctx context.Context, feedID string) (sqlc.Feed, error) {
	const k = "Feed"
	d.keyMutex.Lock(k)
	if d.feed == nil {
		d.feed = newLoaderOne(
			func(ctx context.Context, ids []string) ([]sqlc.Feed, error) {
				return database.FromContext(ctx).Queries().SelectFeeds(ctx, ids)
			},
			func(datum *sqlc.Feed) string {
				return datum.FeedID
			},
		)
	}
	d.keyMutex.Unlock(k)
	return d.feed.Load(ctx, feedID)()
}

func (d *DataLoader) PostSummaryByPostID(ctx context.Context, postID string) (sqlc.PostSummary, error) {
	const k = "PostSummaryByPostID"
	d.keyMutex.Lock(k)
	if d.postSummaryByPostID == nil {
		d.postSummaryByPostID = newLoaderOne(
			func(ctx context.Context, ids []string) ([]sqlc.PostSummary, error) {
				return database.FromContext(ctx).Queries().SelectPostSummariesByPostIDs(ctx, ids)
			},
			func(datum *sqlc.PostSummary) string {
				return datum.PostID
			},
		)
	}
	d.keyMutex.Unlock(k)
	return d.postSummaryByPostID.Load(ctx, postID)()
}

func (d *DataLoader) PostFavoritesByPostID(ctx context.Context, postID string) (sqlc.PostFavorite, error) {
	const k = "PostFavoriteByPostID"
	d.keyMutex.Lock(k)
	if d.postFavoriteByPostID == nil {
		d.postFavoriteByPostID = newLoaderOne(
			func(ctx context.Context, ids []string) ([]sqlc.PostFavorite, error) {
				return database.FromContext(ctx).Queries().SelectPostFavoritesByPostIDs(ctx, ids)
			},
			func(datum *sqlc.PostFavorite) string {
				return datum.PostID
			},
		)
	}
	d.keyMutex.Unlock(k)
	return d.postFavoriteByPostID.Load(ctx, postID)()
}

var ErrNotFound = errors.New("not found")

func newLoaderOne[K comparable, V any](
	fetch func(ctx context.Context, ids []K) ([]V, error),
	getKey func(datum *V) K,
) *dataloader.Loader[K, V] {
	return dataloader.NewBatchedLoader(func(ctx context.Context, keys []K) []*dataloader.Result[V] {
		data, err := fetch(ctx, keys)
		var res []*dataloader.Result[V]
		datumMap := make(map[K]V, len(data))
		for _, d := range data {
			datumMap[getKey(&d)] = d
		}
		for _, key := range keys {
			datumErr := err
			foundDatum, ok := datumMap[key]
			if err == nil && !ok {
				datumErr = ErrNotFound
			}
			res = append(res, &dataloader.Result[V]{
				Data:  foundDatum,
				Error: datumErr,
			})
		}
		return res
	}, dataloader.WithCache[K, V](dataloader.NewCache[K, V]()))
}

//lint:ignore U1000 for future use
func newLoaderMany[K comparable, V any](
	fetch func(ctx context.Context, ids []K) ([]V, error),
	getKey func(datum *V) K,
) *dataloader.Loader[K, []V] {
	return dataloader.NewBatchedLoader(func(ctx context.Context, keys []K) []*dataloader.Result[[]V] {
		data, err := fetch(ctx, keys)
		var res []*dataloader.Result[[]V]
		dataMap := make(map[K][]V)
		for _, d := range data {
			dataMap[getKey(&d)] = append(dataMap[getKey(&d)], d)
		}
		for _, key := range keys {
			datumErr := err
			foundData := dataMap[key]
			res = append(res, &dataloader.Result[[]V]{
				Data:  foundData,
				Error: datumErr,
			})
		}
		return res
	}, dataloader.WithCache[K, []V](dataloader.NewCache[K, []V]()))
}

type ctxKey struct{}

func WithDataLoader(ctx context.Context, dl *DataLoader) context.Context {
	return context.WithValue(ctx, ctxKey{}, dl)
}

func FromContext(ctx context.Context) *DataLoader {
	return ctx.Value(ctxKey{}).(*DataLoader)
}
