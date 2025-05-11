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

-- name: SelectPostForUpdate :one
select *
from posts
where post_id = @post_id
    for update;

-- name: SelectPosts :many
select count(*) over () as total_count,
       sqlc.embed(p)
from posts p
left join post_favorites pf using (post_id)
where (cardinality(@feed_ids::uuid[]) = 0 or p.feed_id = ANY (@feed_ids::uuid[]))
order by case
             when @ord::text = 'PostedAtAsc' then p.posted_at
             end asc,
         case
             when @ord::text = 'PostedAtDesc' then p.posted_at
             end desc,
         p.posted_at desc
limit @lim offset @off
;

-- name: InsertPostFetch :exec
insert into post_fetches (post_fetch_id, post_id, status, message, fetched_at)
values (@post_fetch_id, @post_id, @status, @message, @fetched_at);

-- name: InsertPostSummary :exec
insert into post_summaries (post_summary_id, post_id, summarize_method, summary, summarized_at)
values (@post_summary_id, @post_id, @summarize_method, @summary, @summarized_at);

-- name: SelectPostSummariesByPostIDs :many
select *
from post_summaries
where post_id = ANY (@post_ids::uuid[]);

-- name: SelectPostFavoritesByPostIDs :many
select *
from post_favorites
where post_id = ANY (@post_ids::uuid[]);