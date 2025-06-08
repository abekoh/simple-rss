-- +goose Up
-- +goose StatementBegin
ALTER TABLE feeds ADD COLUMN tags text[] DEFAULT '{}';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE feeds DROP COLUMN tags;
-- +goose StatementEnd
