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

type singleDB struct {
	conn *pgx.Conn
}

var _ DB = (*singleDB)(nil)

func NewSingle(ctx context.Context, cnf *config.Config) (*singleDB, error) {
	conn, err := pgx.Connect(ctx, cnf.DBURL)
	if err != nil {
		return nil, err
	}
	return &singleDB{
		conn: conn,
	}, nil
}

func (db *singleDB) Close() {
	db.conn.Close(context.Background())
}

func (db *singleDB) Queries() *sqlc.Queries {
	return sqlc.New(db.conn)
}

func (db *singleDB) Ping(ctx context.Context) error {
	return db.conn.Ping(ctx)
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

	var tx pgx.Tx
	var err error

	switch d := db.(type) {
	case *poolDB:
		tx, err = d.pool.Begin(ctx)
	case *singleDB:
		tx, err = d.conn.Begin(ctx)
	default:
		return ErrTxAlreadyStarted
	}

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
