-- name: InsertCrawl :exec
insert into crawls (crawl_id, feed_id, status, message, crawled_at)
values (@crawl_id, @feed_id, @status, @message, @crawled_at);
