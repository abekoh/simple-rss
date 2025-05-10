-- name: InsertPost :exec
insert into posts (post_id, feed_id, title, description, author, url, posted_at, status)
values (@post_id, @feed_id, @title, @description, @author, @url, @posted_at, @status);

-- name: UpdatePost :exec
update posts
set title           = @title,
    description     = @description,
    author          = @author,
    url             = @url,
    posted_at       = @posted_at,
    last_fetched_at = @last_fetched_at,
    status          = @status,
    updated_at      = now()
where post_id = @post_id;

-- name: SelectPost :one
select *
from posts
where post_id = @post_id;

-- name: SelectPostsOrderByPostedAtAsc :many
select *
from posts
order by posted_at asc;

-- name: InsertPostFetch :exec
insert into post_fetches (post_fetch_id, post_id, status, message, fetched_at)
values (@post_fetch_id, @post_id, @status, @message, @fetched_at);