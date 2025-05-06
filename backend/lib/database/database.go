package database

import (
	"context"
	"database/sql"
)

type DB struct {
	db *sql.DB
}

type ctxKey struct{}

func WithDB(ctx context.Context, db *DB) context.Context {
	return context.WithValue(ctx, ctxKey{}, db)
}

func GetDB(ctx context.Context) *DB {
	return ctx.Value(ctxKey{}).(*DB)
}
