package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/abekoh/simple-rss/backend/gql"
	"github.com/abekoh/simple-rss/backend/gql/resolver"
	"github.com/abekoh/simple-rss/backend/lib/config"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/worker/feedfetcher"
	"github.com/abekoh/simple-rss/backend/worker/postfetcher"
	"github.com/go-chi/chi/v5"
	"github.com/vektah/gqlparser/v2/ast"
)

func main() {
	routerCtx := context.Background()
	cnf := config.Load()
	r := chi.NewRouter()

	errCh := make(chan error, 10)
	feedFetcherRequestCh := make(chan feedfetcher.Request, 10)
	feedFetcherResultCh := make(chan feedfetcher.Result, 10)
	postFetcherRequestCh := make(chan postfetcher.Request, 10)
	postFetcherResultCh := make(chan postfetcher.Result, 10)

	feedFetcher := feedfetcher.NewFeedFetcher(
		routerCtx,
		feedFetcherRequestCh,
		feedFetcherResultCh,
		errCh,
	)
	postFetcher := postfetcher.NewPostFetcher(
		routerCtx,
		postFetcherRequestCh,
		postFetcherResultCh,
		errCh,
	)

	// error handler
	go func() {
		for {
			err := <-errCh
			slog.Error(err.Error())
		}
	}()

	// FeedFetcher -> PostFetcher
	go func() {
		for {
			ffResult := <-feedFetcherResultCh
			postFetcherRequestCh <- postfetcher.Request{
				PostID: ffResult.PostID,
			}
		}
	}()

	// PostFetcher -> nop
	go func() {
		for {
			ppResult := <-postFetcherResultCh
			_ = ppResult
		}
	}()

	// config
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := config.WithConfig(r.Context(), cnf)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})

	// database
	db, err := database.New(routerCtx, cnf)
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
	defer db.Close()
	if err := db.Ping(routerCtx); err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := database.WithDB(r.Context(), db)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})

	gqlSrv := handler.New(gql.NewExecutableSchema(gql.Config{
		Resolvers: resolver.NewResolver(
			feedFetcher,
			postFetcher,
		)},
	))
	gqlSrv.AddTransport(transport.Options{})
	gqlSrv.AddTransport(transport.GET{})
	gqlSrv.AddTransport(transport.POST{})
	gqlSrv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	gqlSrv.Use(extension.Introspection{})
	gqlSrv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// graphql
	r.Post("/query", gqlSrv.ServeHTTP)
	r.Get("/query", playground.Handler("GraphQL playground", "/query"))

	slog.Info("listening on port", "port", cnf.Port)
	if err := http.ListenAndServe(":"+cnf.Port, r); err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
}
