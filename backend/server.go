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
	"github.com/go-chi/chi/v5"
	"github.com/vektah/gqlparser/v2/ast"
)

func main() {
	cnf := config.Load()
	ctx := context.Background()
	ctx = config.WithConfig(ctx, cnf)

	r := chi.NewRouter()

	r.Post("/query", initializeGQLServer(ctx).ServeHTTP)
	r.Get("/query", playground.Handler("GraphQL playground", "/query"))

	slog.Info("listening on port", "port", cnf.Port)
	if err := http.ListenAndServe(":"+cnf.Port, r); err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
}

func initializeGQLServer(ctx context.Context) *handler.Server {
	srv := handler.New(gql.NewExecutableSchema(gql.Config{Resolvers: &resolver.Resolver{}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})
	return srv
}
