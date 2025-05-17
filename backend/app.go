//go:generate go tool github.com/sqlc-dev/sqlc/cmd/sqlc generate
//go:generate go tool github.com/99designs/gqlgen
package main

import (
	"context"
	"database/sql"
	"embed"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/abekoh/simple-rss/backend/gql"
	"github.com/abekoh/simple-rss/backend/gql/resolver"
	"github.com/abekoh/simple-rss/backend/lib/cachehttp"
	"github.com/abekoh/simple-rss/backend/lib/config"
	"github.com/abekoh/simple-rss/backend/lib/database"
	"github.com/abekoh/simple-rss/backend/lib/dataloader"
	"github.com/abekoh/simple-rss/backend/worker/feedfetcher"
	"github.com/abekoh/simple-rss/backend/worker/postfetcher"
	"github.com/abekoh/simple-rss/backend/worker/scheduler"
	"github.com/abekoh/simple-rss/backend/worker/summarizer"
	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type CustomClaims struct {
	Scope string `json:"scope,omitempty"`
	Azp   string `json:"azp,omitempty"`
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

//go:embed migrations/*.sql
var embedMigrations embed.FS

func main() {
	cnf := config.Load()
	routerCtx := context.Background()

	// migration
	goose.SetBaseFS(embedMigrations)
	if err := goose.SetDialect("postgres"); err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
	sqlDB, err := sql.Open("pgx", cnf.DBURL)
	if err := goose.Up(sqlDB, "migrations"); err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
	_ = sqlDB.Close()

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

	routerCtx = config.WithConfig(routerCtx, cnf)
	routerCtx = database.WithDB(routerCtx, db)

	errCh := make(chan error, 10)
	feedFetcherRequestCh := make(chan feedfetcher.Request, 10)
	feedFetcherResultCh := make(chan feedfetcher.Result, 10)
	postFetcherRequestCh := make(chan postfetcher.Request, 10)
	postFetcherResultCh := make(chan postfetcher.Result, 10)
	summarizerRequestCh := make(chan summarizer.Request, 10)
	summarizerResultCh := make(chan summarizer.Result, 10)

	cacheHTTPCLient := cachehttp.NewClient()
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
		cacheHTTPCLient,
	)
	sum, err := summarizer.NewSummarizer(
		routerCtx,
		summarizerRequestCh,
		summarizerResultCh,
		errCh,
		cacheHTTPCLient,
	)
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}

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
			slog.Info("feed fetcher result", "feed_id", ffResult.FeedID, "post_id", ffResult.PostID)
			postFetcherRequestCh <- postfetcher.Request{
				PostID: ffResult.PostID,
			}
		}
	}()

	_ = scheduler.NewScheduler(
		routerCtx,
		feedFetcher,
		postFetcher,
		errCh,
	)

	// PostFetcher -> Summarizer
	go func() {
		for {
			ppResult := <-postFetcherResultCh
			slog.Info("post fetcher result", "post_id", ppResult.PostID)
			summarizerRequestCh <- summarizer.Request{
				PostID: ppResult.PostID,
			}
		}
	}()

	// Summarizer -> nop
	go func() {
		for {
			sResult := <-summarizerResultCh
			slog.Info("summarizer result", "post_id", sResult.PostID, "post_summary_id", sResult.PostSummaryID)
		}
	}()

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := config.WithConfig(r.Context(), cnf)
			ctx = database.WithDB(ctx, db)
			ctx = dataloader.WithDataLoader(ctx, dataloader.New())
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	const issuerURLStr = "https://abekoh.jp.auth0.com/"
	issuerURL, err := url.Parse(issuerURLStr)
	if issuerURL == nil {
		log.Fatalf("failed to parse issuer url: %v", err)
	}
	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)
	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURLStr,
		[]string{"https://reader-api.abekoh.dev/"},
		validator.WithCustomClaims(func() validator.CustomClaims {
			return &CustomClaims{}
		}),
	)
	if err != nil {
		log.Fatalf("failed to set up the validator: %v", err)
	}
	jwtMiddleware := jwtmiddleware.New(
		jwtValidator.ValidateToken,
		jwtmiddleware.WithCredentialsOptional(true),
	)
	r.Use(jwtMiddleware.CheckJWT)

	gqlSrv := handler.New(gql.NewExecutableSchema(gql.Config{
		Resolvers: resolver.NewResolver(
			feedFetcher,
			postFetcher,
			sum,
		)},
	))
	gqlSrv.AroundOperations(func(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
		op := graphql.GetOperationContext(ctx)
		if op.Operation.Operation != ast.Mutation {
			return next(ctx)
		}
		setErr := func(ctx context.Context) {
			graphql.AddError(ctx, &gqlerror.Error{
				Path:    graphql.GetPath(ctx),
				Message: "mutation is not allowed for this user",
			})
		}
		claims, ok := ctx.Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		if !ok {
			setErr(ctx)
			return next(ctx)
		}
		customClaims, ok := claims.CustomClaims.(*CustomClaims)
		if !ok {
			setErr(ctx)
			return next(ctx)
		}
		scopes := strings.Split(customClaims.Scope, " ")
		for _, scope := range scopes {
			if scope == "write" {
				return next(ctx)
			}
		}
		setErr(ctx)
		return next(ctx)
	})
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
