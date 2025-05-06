-- +goose Up
CREATE TABLE feeds (
    feed_id uuid primary key,
    url text not null unique,
    title text not null,
    description text,
    registered_at timestamp with time zone not null,
    created_at timestamp with time zone not null default now()
);

CREATE TYPE feed_status AS ENUM ('Success', 'Failure');

CREATE TABLE crawls (
    crawl_id uuid primary key,
    feed_id uuid not null references feeds(feed_id),
    status feed_status not null,
    meessage text,
    crawled_at timestamp with time zone not null,
    created_at timestamp with time zone not null default now()
);

CREATE TABLE posts (
    post_id uuid primary key,
    feed_id uuid not null references feeds(feed_id),
    crawl_id uuid not null references crawls(crawl_id),
    title text not null,
    author text,
    url text not null unique,
    summary_original text,
    posted_at timestamp with time zone not null,
    created_at timestamp with time zone not null default now()
);

CREATE INDEX posts_feed_id_idx ON posts(feed_id);

CREATE INDEX posts_crawl_id_idx ON posts(crawl_id);

-- +goose Down

DROP TABLE posts;

DROP TABLE crawls;

DROP TABLE feeds;