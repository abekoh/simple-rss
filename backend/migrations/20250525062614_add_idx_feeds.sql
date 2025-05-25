-- +goose Up
-- +goose StatementBegin
ALTER TABLE feeds
    ADD COLUMN idx int;

WITH feeds_with_row_num AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY registered_at DESC) AS row_num
    FROM
        feeds)
UPDATE
    feeds
SET
    idx = feeds_with_row_num.row_num,
    updated_at = NOW()
FROM
    feeds_with_row_num
WHERE
    feeds.id = feeds_with_row_num.id;

ALTER TABLE feeds
    ALTER COLUMN idx SET NOT NULL;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE feeds
    DROP COLUMN idx;

-- +goose StatementEnd
