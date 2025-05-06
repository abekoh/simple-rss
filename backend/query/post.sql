-- name: InsertPost :exec
insert into posts (post_id, feed_id, crawl_id, title, author, url, summary_original, posted_at)
values (@post_id, @feed_id, @crawl_id, @title, @author, @url, @summary_original, @posted_at);

-- name: SelectPostByURL :one
select * from posts where url = @url;