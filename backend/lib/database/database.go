package database

import (
	"context"
	"errors"

	"github.com/abekoh/simple-rss/backend/lib/config"
	"github.com/abekoh/simple-rss/backend/lib/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ sqlc.DBTX = (*pgxpool.Pool)(nil)

type DB interface {
	Queries() *sqlc.Queries
	Close()
	Ping(ctx context.Context) error
}

type poolDB struct {
	pool *pgxpool.Pool
}

var _ DB = (*poolDB)(nil)

func New(ctx context.Context, cnf *config.Config) (*poolDB, error) {
	pool, err := pgxpool.New(ctx, cnf.DBURL)
	if err != nil {
		return nil, err
	}
	return &poolDB{
		pool: pool,
	}, nil
}

func (db *poolDB) Close() {
	db.pool.Close()
}

func (db *poolDB) Queries() *sqlc.Queries {
	return sqlc.New(db.pool)
}

func (db *poolDB) Ping(ctx context.Context) error {
	return db.pool.Ping(ctx)
}

type txDB struct {
	tx pgx.Tx
}

var _ DB = (*txDB)(nil)

func (t *txDB) Queries() *sqlc.Queries {
	return sqlc.New(t.tx)
}

func (t *txDB) Close() {
}

func (t *txDB) Ping(ctx context.Context) error {
	return nil
}

type ctxKey struct{}

func WithDB(ctx context.Context, db DB) context.Context {
	return context.WithValue(ctx, ctxKey{}, db)
}

func FromContext(ctx context.Context) DB {
	return ctx.Value(ctxKey{}).(DB)
}

var ErrTxAlreadyStarted = errors.New("transaction already started")

func Transaction(ctx context.Context, f func(c context.Context) error) error {
	db := FromContext(ctx)
	poolD, ok := db.(*poolDB)
	if !ok {
		return ErrTxAlreadyStarted
	}
	tx, err := poolD.pool.Begin(ctx)
	if err != nil {
		return err
	}
	txD := &txDB{tx: tx}
	if err := f(WithDB(ctx, txD)); err != nil {
		rollbackErr := tx.Rollback(ctx)
		if rollbackErr != nil {
			return errors.Join(err, rollbackErr)
		}
		return err
	}
	return tx.Commit(ctx)
}
