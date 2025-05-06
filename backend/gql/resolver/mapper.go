package resolver

import (
	"time"

	"github.com/abekoh/simple-rss/backend/gql"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func mapSlice[T, U any](xs []T, f func(x T) U) []U {
	ys := make([]U, len(xs))
	for i, x := range xs {
		ys[i] = f(x)
	}
	return ys
}

func mapUUID(x pgtype.UUID) uuid.UUID {
	return uuid.UUID(x.Bytes)
}

func mapNullableText(x pgtype.Text) *string {
	if !x.Valid {
		return nil
	}
	return &x.String
}

func mapTimestampz(x pgtype.Timestamptz) time.Time {
	return x.Time
}

func mapFeed(x sqlc.Feed) *gql.Feed {
	return &gql.Feed{
		FeedID:       mapUUID(x.FeedID),
		URL:          x.Url,
		Title:        x.Title,
		Description:  mapNullableText(x.Description),
		RegisteredAt: mapTimestampz(x.RegisteredAt),
	}
}
