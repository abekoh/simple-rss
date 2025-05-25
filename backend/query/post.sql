-- name: InsertPost :exec
INSERT INTO posts(post_id, feed_id, title, description, author, url, posted_at, status)
    VALUES (@post_id, @feed_id, @title, @description, @author, @url, @posted_at, @status);

-- name: UpdatePost :exec
UPDATE
    posts
SET
    title = @title,
    description = @description,
    author = @author,
    url = @url,
    posted_at = @posted_at,
    last_fetched_at = @last_fetched_at,
    status = @status,
    updated_at = now()
WHERE
    post_id = @post_id;

-- name: SelectPost :one
SELECT
    *
FROM
    posts
WHERE
    post_id = @post_id;

-- name: SelectPostForUpdate :one
SELECT
    *
FROM
    posts
WHERE
    post_id = @post_id
FOR UPDATE;

-- name: SelectPosts :many
SELECT
    count(*) OVER () AS total_count,
    sqlc.embed(p)
FROM
    posts p
    LEFT JOIN post_favorites pf USING (post_id)
WHERE ((cardinality(@feed_ids::uuid[]) = 0
        OR p.feed_id = ANY (@feed_ids::uuid[])))
AND (@only_have_favorites::boolean = FALSE
    OR pf.post_favorite_id IS NOT NULL)
ORDER BY
    CASE WHEN @ord::text = 'PostedAtAsc' THEN
        p.posted_at
    END ASC nulls LAST,
    CASE WHEN @ord::text = 'PostedAtDesc' THEN
        p.posted_at
    END DESC nulls LAST,
    p.posted_at DESC nulls LAST
LIMIT @lim offset @off;

-- name: InsertPostFetch :exec
INSERT INTO post_fetches(post_fetch_id, post_id, status, message, fetched_at)
    VALUES (@post_fetch_id, @post_id, @status, @message, @fetched_at);

-- name: InsertPostSummary :exec
INSERT INTO post_summaries(post_summary_id, post_id, summarize_method, summary, summarized_at)
    VALUES (@post_summary_id, @post_id, @summarize_method, @summary, @summarized_at);

-- name: SelectPostSummariesByPostIDs :many
SELECT
    *
FROM
    post_summaries
WHERE
    post_id = ANY (@post_ids::uuid[]);

-- name: SelectPostFavoritesByPostIDs :many
SELECT
    *
FROM
    post_favorites
WHERE
    post_id = ANY (@post_ids::uuid[]);

-- name: SelectPostFavorite :one
SELECT
    *
FROM
    post_favorites
WHERE
    post_favorite_id = @post_favorite_id;

-- name: InsertPostFavorite :exec
INSERT INTO post_favorites(post_favorite_id, post_id, added_at)
    VALUES (@post_favorite_id, @post_id, @added_at);

-- name: DeletePostFavorite :exec
DELETE FROM post_favorites
WHERE post_favorite_id = @post_favorite_id;

