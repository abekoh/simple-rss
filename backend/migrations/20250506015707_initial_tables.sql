-- +goose Up
CREATE TABLE feeds
(
    feed_id         uuid primary key,
    url             text                     not null unique,
    title           text                     not null,
    description     text,
    registered_at   timestamp with time zone not null,
    last_fetched_at timestamp with time zone,
    created_at      timestamp with time zone not null default now(),
    updated_at      timestamp with time zone not null default now()
);

CREATE INDEX feeds_url_idx ON feeds (url);

CREATE TYPE feed_fetch_status AS ENUM ('Success', 'Failure');

CREATE TABLE feed_fetches
(
    feed_fetch_id uuid primary key,
    feed_id       uuid                     not null references feeds (feed_id) on delete cascade,
    status        feed_fetch_status        not null,
    message       text,
    fetched_at    timestamp with time zone not null,
    created_at    timestamp with time zone not null default now()
);

CREATE TYPE post_status AS ENUM ('Registered', 'Fetched', 'Summarized');

CREATE TABLE posts
(
    post_id         uuid primary key,
    feed_id         uuid                     not null references feeds (feed_id) on delete cascade,
    url             text                     not null unique,
    title           text                     not null,
    description     text,
    author          text,
    status          post_status              not null,
    posted_at       timestamp with time zone,
    last_fetched_at timestamp with time zone,
    created_at      timestamp with time zone not null default now(),
    updated_at      timestamp with time zone not null default now()
);

CREATE INDEX posts_feed_id_idx ON posts (feed_id);

CREATE TYPE post_fetch_status AS ENUM ('Success', 'Failure');

CREATE TABLE post_fetches
(
    post_fetch_id uuid primary key,
    post_id       uuid                     not null references posts (post_id) on delete cascade,
    status        post_fetch_status        not null,
    message       text,
    fetched_at    timestamp with time zone not null,
    created_at    timestamp with time zone not null default now()
);

CREATE TABLE post_summaries
(
    post_summary_id  uuid primary key,
    post_id          uuid                     not null references posts (post_id) on delete cascade,
    summarize_method text                     not null,
    summary          text                     not null,
    summarized_at    timestamp with time zone not null,
    created_at       timestamp with time zone not null default now()
);

create index post_summaries_post_id_idx ON post_summaries (post_id);

-- +goose Down

DROP TABLE post_summaries;
DROP TABLE post_fetches;
DROP TYPE post_fetch_status;
DROP TABLE posts;
DROP TYPE post_status;
DROP TABLE feed_fetches;
DROP TYPE feed_fetch_status;
DROP TABLE feeds;