-- name: InsertFeed :exec
INSERT INTO feeds(feed_id, url, title_original, description, registered_at, idx)
    VALUES (@feed_id, @url, @title_original, @description, @registered_at, @idx);

-- name: UpdateFeedLastFetchedAt :exec
UPDATE
    feeds
SET
    last_fetched_at = @last_fetched_at::timestamp with time zone,
    updated_at = now()
WHERE
    feed_id = @feed_id;

-- name: UpdateFeedTitle :exec
UPDATE
    feeds
SET
    title_editted = @title_editted,
    updated_at = now()
WHERE
    feed_id = @feed_id;

-- name: SelectFeed :one
SELECT
    *
FROM
    feeds
WHERE
    feed_id = @feed_id;

-- name: SelectFeedForUpdate :one
SELECT
    *
FROM
    feeds
WHERE
    feed_id = @feed_id
FOR UPDATE;

-- name: SelectFeeds :many
SELECT
    *
FROM
    feeds
WHERE
    feed_id = ANY (@feed_ids::uuid[]);

-- name: SelectFeedsOrderByIdxAsc :many
SELECT
    *
FROM
    feeds
ORDER BY
    idx ASC;

-- name: SelectRecentlyNotFetchedFeeds :many
SELECT
    *
FROM
    feeds
WHERE
    last_fetched_at IS NULL
    OR last_fetched_at < @last_fetched_at_threshold::timestamp with time zone
ORDER BY
    last_fetched_at ASC;

-- name: DeleteFeed :exec
DELETE FROM feeds
WHERE feed_id = @feed_id;

-- name: InsertFeedFetch :exec
INSERT INTO feed_fetches(feed_fetch_id, feed_id, status, message, fetched_at)
    VALUES (@feed_fetch_id, @feed_id, @status, @message, @fetched_at);

