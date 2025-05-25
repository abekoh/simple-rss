-- +goose Up
-- +goose StatementBegin
-- シーケンスの作成
CREATE SEQUENCE IF NOT EXISTS feeds_idx_seq;

-- カラムの追加とシーケンスの関連付け
ALTER TABLE feeds
    ADD COLUMN idx int UNIQUE DEFAULT nextval('feeds_idx_seq');

-- 既存のレコードに対して値を設定
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

-- シーケンスの現在値を更新（既存の最大値の次の値に設定）
SELECT
    setval('feeds_idx_seq', COALESCE((
            SELECT
                MAX(idx)
            FROM feeds), 0) + 1, FALSE);

-- NOT NULL制約の追加
ALTER TABLE feeds
    ALTER COLUMN idx SET NOT NULL;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE feeds
    DROP COLUMN idx;

-- シーケンスの削除
DROP SEQUENCE IF EXISTS feeds_idx_seq;

-- +goose StatementEnd
