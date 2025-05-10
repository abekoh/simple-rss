-- name: InsertFeed :exec
insert into feeds (feed_id, url, title, description, registered_at)
values (@feed_id, @url, @title, @description, @registered_at);

-- name: UpsertFeedLastFetchedAt :exec
update feeds
set last_fetched_at = @last_fetched_at,
    updated_at      = now();

-- name: SelectFeed :one
select *
from feeds
where feed_id = @feed_id;

-- name: SelectFeeds :many
select *
from feeds
where feed_id = ANY (@feed_ids::uuid[]);

-- name: SelectFeedsOrderByRegisteredAtAsc :many
select *
from feeds
order by registered_at asc;

-- name: DeleteFeed :exec
delete
from feeds
where feed_id = @feed_id;

-- name: InsertFeedFetch :exec
insert into feed_fetches (feed_fetch_id, feed_id, status, message, fetched_at)
values (@feed_fetch_id, @feed_id, @status, @message, @fetched_at);