-- +goose Up
-- +goose StatementBegin
ALTER TABLE feeds RENAME COLUMN title TO title_original;

ALTER TABLE feeds
    ADD COLUMN title_editted text;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE feeds RENAME COLUMN title_original TO title;

ALTER TABLE feeds
    DROP COLUMN title_editted;

-- +goose StatementEnd
