-- +goose Up
-- +goose StatementBegin
ALTER TABLE feeds
    ADD CONSTRAINT feeds_idx_unique UNIQUE (idx) DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX idx_feeds_idx ON feeds(idx);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE feeds
    DROP CONSTRAINT feeds_idx_unique;

DROP INDEX idx_feeds_idx;

-- +goose StatementEnd
