package database

import (
	"context"
	"errors"

	"github.com/abekoh/simple-rss/backend/lib/keymutex"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/graph-gophers/dataloader/v7"
)

type DataLoader struct {
	keyMutex *keymutex.KeyMutex
	feed     *dataloader.Loader[string, sqlc.Feed]
}

func NewDataLoader() *DataLoader {
	return &DataLoader{
		keyMutex: keymutex.New(),
	}
}

func (d *DataLoader) Feed(ctx context.Context, feedID string) (sqlc.Feed, error) {
	m := d.keyMutex.Get("Feed")
	if d.feed == nil {
		d.feed = newLoaderOne(
			func(ctx context.Context, ids []string) ([]sqlc.Feed, error) {
				return FromContext(ctx).Queries().SelectFeeds(ctx, ids)
			},
			func(datum *sqlc.Feed) string {
				return datum.FeedID
			},
		)
	}
	m.Unlock()
	return d.feed.Load(ctx, feedID)()
}

var ErrNotFound = errors.New("not found")

func newLoaderOne[K comparable, V any](
	fetch func(ctx context.Context, ids []K) ([]V, error),
	getKey func(datum *V) K,
) *dataloader.Loader[K, V] {
	return dataloader.NewBatchedLoader(func(ctx context.Context, keys []K) []*dataloader.Result[V] {
		data, err := fetch(ctx, keys)
		var res []*dataloader.Result[V]
		var dataMap = make(map[K]V)
		for _, d := range data {
			dataMap[getKey(&d)] = d
		}
		for _, key := range keys {
			datumErr := err
			found, ok := dataMap[key]
			if err == nil && !ok {
				datumErr = ErrNotFound
			}
			res = append(res, &dataloader.Result[V]{
				Data:  found,
				Error: datumErr,
			})
		}
		return res
	}, dataloader.WithCache[K, V](dataloader.NewCache[K, V]()))
}
