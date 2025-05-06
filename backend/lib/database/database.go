package database

import (
	"context"

	"github.com/abekoh/simple-rss/backend/lib/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, cnf *config.Config) (*DB, error) {
	pool, err := pgxpool.New(ctx, cnf.DBURL)
	if err != nil {
		return nil, err
	}
	return &DB{pool: pool}, nil
}

func (db *DB) Close() {
	db.pool.Close()
}

type ctxKey struct{}

func WithDB(ctx context.Context, db *DB) context.Context {
	return context.WithValue(ctx, ctxKey{}, db)
}

func FromContext(ctx context.Context) *DB {
	return ctx.Value(ctxKey{}).(*DB)
}
