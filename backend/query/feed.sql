-- name: InsertFeed :exec
insert into feeds (feed_id, url, title, description, registered_at)
values (@feed_id, @url, @title, @description, @registered_at);

-- name: SelectFeed :one
select * from feeds where feed_id = @feed_id;

-- name: SelectFeedsOrderByRegisteredAtAsc :many
select * from feeds order by registered_at asc;