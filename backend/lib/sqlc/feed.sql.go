// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: feed.sql

package sqlc

import (
	"context"
	"time"
)

const deleteFeed = `-- name: DeleteFeed :exec
DELETE FROM feeds
WHERE feed_id = $1
`

func (q *Queries) DeleteFeed(ctx context.Context, feedID string) error {
	_, err := q.db.Exec(ctx, deleteFeed, feedID)
	return err
}

const insertFeed = `-- name: InsertFeed :exec
INSERT INTO feeds(feed_id, url, title_original, description, registered_at)
    VALUES ($1, $2, $3, $4, $5)
`

type InsertFeedParams struct {
	FeedID        string
	Url           string
	TitleOriginal string
	Description   *string
	RegisteredAt  time.Time
}

func (q *Queries) InsertFeed(ctx context.Context, arg InsertFeedParams) error {
	_, err := q.db.Exec(ctx, insertFeed,
		arg.FeedID,
		arg.Url,
		arg.TitleOriginal,
		arg.Description,
		arg.RegisteredAt,
	)
	return err
}

const insertFeedFetch = `-- name: InsertFeedFetch :exec
INSERT INTO feed_fetches(feed_fetch_id, feed_id, status, message, fetched_at)
    VALUES ($1, $2, $3, $4, $5)
`

type InsertFeedFetchParams struct {
	FeedFetchID string
	FeedID      string
	Status      FeedFetchStatus
	Message     *string
	FetchedAt   time.Time
}

func (q *Queries) InsertFeedFetch(ctx context.Context, arg InsertFeedFetchParams) error {
	_, err := q.db.Exec(ctx, insertFeedFetch,
		arg.FeedFetchID,
		arg.FeedID,
		arg.Status,
		arg.Message,
		arg.FetchedAt,
	)
	return err
}

const selectFeed = `-- name: SelectFeed :one
SELECT
    feed_id, url, title_original, description, registered_at, last_fetched_at, created_at, updated_at, title_editted, idx, tags
FROM
    feeds
WHERE
    feed_id = $1
`

func (q *Queries) SelectFeed(ctx context.Context, feedID string) (Feed, error) {
	row := q.db.QueryRow(ctx, selectFeed, feedID)
	var i Feed
	err := row.Scan(
		&i.FeedID,
		&i.Url,
		&i.TitleOriginal,
		&i.Description,
		&i.RegisteredAt,
		&i.LastFetchedAt,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.TitleEditted,
		&i.Idx,
		&i.Tags,
	)
	return i, err
}

const selectFeedForUpdate = `-- name: SelectFeedForUpdate :one
SELECT
    feed_id, url, title_original, description, registered_at, last_fetched_at, created_at, updated_at, title_editted, idx, tags
FROM
    feeds
WHERE
    feed_id = $1
FOR UPDATE
`

func (q *Queries) SelectFeedForUpdate(ctx context.Context, feedID string) (Feed, error) {
	row := q.db.QueryRow(ctx, selectFeedForUpdate, feedID)
	var i Feed
	err := row.Scan(
		&i.FeedID,
		&i.Url,
		&i.TitleOriginal,
		&i.Description,
		&i.RegisteredAt,
		&i.LastFetchedAt,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.TitleEditted,
		&i.Idx,
		&i.Tags,
	)
	return i, err
}

const selectFeedMaxIdx = `-- name: SelectFeedMaxIdx :one
SELECT
    MAX(idx)::int
FROM
    feeds
`

func (q *Queries) SelectFeedMaxIdx(ctx context.Context) (int32, error) {
	row := q.db.QueryRow(ctx, selectFeedMaxIdx)
	var column_1 int32
	err := row.Scan(&column_1)
	return column_1, err
}

const selectFeeds = `-- name: SelectFeeds :many
SELECT
    feed_id, url, title_original, description, registered_at, last_fetched_at, created_at, updated_at, title_editted, idx, tags
FROM
    feeds
WHERE
    feed_id = ANY ($1::uuid[])
`

func (q *Queries) SelectFeeds(ctx context.Context, feedIds []string) ([]Feed, error) {
	rows, err := q.db.Query(ctx, selectFeeds, feedIds)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Feed
	for rows.Next() {
		var i Feed
		if err := rows.Scan(
			&i.FeedID,
			&i.Url,
			&i.TitleOriginal,
			&i.Description,
			&i.RegisteredAt,
			&i.LastFetchedAt,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.TitleEditted,
			&i.Idx,
			&i.Tags,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const selectFeedsOrderByIdxAsc = `-- name: SelectFeedsOrderByIdxAsc :many
SELECT
    feed_id, url, title_original, description, registered_at, last_fetched_at, created_at, updated_at, title_editted, idx, tags
FROM
    feeds
ORDER BY
    idx ASC
`

func (q *Queries) SelectFeedsOrderByIdxAsc(ctx context.Context) ([]Feed, error) {
	rows, err := q.db.Query(ctx, selectFeedsOrderByIdxAsc)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Feed
	for rows.Next() {
		var i Feed
		if err := rows.Scan(
			&i.FeedID,
			&i.Url,
			&i.TitleOriginal,
			&i.Description,
			&i.RegisteredAt,
			&i.LastFetchedAt,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.TitleEditted,
			&i.Idx,
			&i.Tags,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const selectRecentlyNotFetchedFeeds = `-- name: SelectRecentlyNotFetchedFeeds :many
SELECT
    feed_id, url, title_original, description, registered_at, last_fetched_at, created_at, updated_at, title_editted, idx, tags
FROM
    feeds
WHERE
    last_fetched_at IS NULL
    OR last_fetched_at < $1::timestamp with time zone
ORDER BY
    last_fetched_at ASC
`

func (q *Queries) SelectRecentlyNotFetchedFeeds(ctx context.Context, lastFetchedAtThreshold time.Time) ([]Feed, error) {
	rows, err := q.db.Query(ctx, selectRecentlyNotFetchedFeeds, lastFetchedAtThreshold)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Feed
	for rows.Next() {
		var i Feed
		if err := rows.Scan(
			&i.FeedID,
			&i.Url,
			&i.TitleOriginal,
			&i.Description,
			&i.RegisteredAt,
			&i.LastFetchedAt,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.TitleEditted,
			&i.Idx,
			&i.Tags,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateFeedIdx = `-- name: UpdateFeedIdx :exec
UPDATE
    feeds
SET
    idx = $1,
    updated_at = now()
WHERE
    feed_id = $2
`

type UpdateFeedIdxParams struct {
	Idx    int32
	FeedID string
}

func (q *Queries) UpdateFeedIdx(ctx context.Context, arg UpdateFeedIdxParams) error {
	_, err := q.db.Exec(ctx, updateFeedIdx, arg.Idx, arg.FeedID)
	return err
}

const updateFeedIdxesDecrement = `-- name: UpdateFeedIdxesDecrement :exec
UPDATE
    feeds
SET
    idx = idx - 1
WHERE
    idx BETWEEN $1 AND $2
`

type UpdateFeedIdxesDecrementParams struct {
	IdxFrom int32
	IdxTo   int32
}

func (q *Queries) UpdateFeedIdxesDecrement(ctx context.Context, arg UpdateFeedIdxesDecrementParams) error {
	_, err := q.db.Exec(ctx, updateFeedIdxesDecrement, arg.IdxFrom, arg.IdxTo)
	return err
}

const updateFeedIdxesIncrement = `-- name: UpdateFeedIdxesIncrement :exec
UPDATE
    feeds
SET
    idx = idx + 1
WHERE
    idx BETWEEN $1 AND $2
`

type UpdateFeedIdxesIncrementParams struct {
	IdxFrom int32
	IdxTo   int32
}

func (q *Queries) UpdateFeedIdxesIncrement(ctx context.Context, arg UpdateFeedIdxesIncrementParams) error {
	_, err := q.db.Exec(ctx, updateFeedIdxesIncrement, arg.IdxFrom, arg.IdxTo)
	return err
}

const updateFeedLastFetchedAt = `-- name: UpdateFeedLastFetchedAt :exec
UPDATE
    feeds
SET
    last_fetched_at = $1::timestamp with time zone,
    updated_at = now()
WHERE
    feed_id = $2
`

type UpdateFeedLastFetchedAtParams struct {
	LastFetchedAt time.Time
	FeedID        string
}

func (q *Queries) UpdateFeedLastFetchedAt(ctx context.Context, arg UpdateFeedLastFetchedAtParams) error {
	_, err := q.db.Exec(ctx, updateFeedLastFetchedAt, arg.LastFetchedAt, arg.FeedID)
	return err
}

const updateFeedTitle = `-- name: UpdateFeedTitle :exec
UPDATE
    feeds
SET
    title_editted = $1,
    updated_at = now()
WHERE
    feed_id = $2
`

type UpdateFeedTitleParams struct {
	TitleEditted *string
	FeedID       string
}

func (q *Queries) UpdateFeedTitle(ctx context.Context, arg UpdateFeedTitleParams) error {
	_, err := q.db.Exec(ctx, updateFeedTitle, arg.TitleEditted, arg.FeedID)
	return err
}
