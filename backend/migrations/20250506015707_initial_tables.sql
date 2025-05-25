-- +goose Up
CREATE TABLE feeds(
    feed_id uuid PRIMARY KEY,
    url text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    registered_at timestamp with time zone NOT NULL,
    last_fetched_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX feeds_url_idx ON feeds(url);

CREATE TYPE feed_fetch_status AS ENUM(
    'Success',
    'Failure'
);

CREATE TABLE feed_fetches(
    feed_fetch_id uuid PRIMARY KEY,
    feed_id uuid NOT NULL REFERENCES feeds(feed_id) ON DELETE CASCADE,
    status feed_fetch_status NOT NULL,
    message text,
    fetched_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TYPE post_status AS ENUM(
    'Registered',
    'Fetched',
    'Summarized'
);

CREATE TABLE posts(
    post_id uuid PRIMARY KEY,
    feed_id uuid NOT NULL REFERENCES feeds(feed_id) ON DELETE CASCADE,
    url text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    author text,
    status post_status NOT NULL,
    posted_at timestamp with time zone,
    last_fetched_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX posts_feed_id_idx ON posts(feed_id);

CREATE TYPE post_fetch_status AS ENUM(
    'Success',
    'Failure'
);

CREATE TABLE post_fetches(
    post_fetch_id uuid PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    status post_fetch_status NOT NULL,
    message text,
    fetched_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE post_summaries(
    post_summary_id uuid PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    summarize_method text NOT NULL,
    summary text NOT NULL,
    summarized_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX post_summaries_post_id_idx ON post_summaries(post_id);

CREATE TABLE post_favorites(
    post_favorite_id uuid PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    added_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX post_favorites_post_id_idx ON post_favorites(post_id);

-- +goose Down
DROP TABLE post_favorites;

DROP TABLE post_summaries;

DROP TABLE post_fetches;

DROP TYPE post_fetch_status;

DROP TABLE posts;

DROP TYPE post_status;

DROP TABLE feed_fetches;

DROP TYPE feed_fetch_status;

DROP TABLE feeds;

