package config

import (
	"context"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Port               string `envconfig:"PORT"`
	DBURL              string `envconfig:"DB_URL"`
	EnableSummarize    bool   `envconfig:"ENABLE_SUMMARIZE" default:"true"`
	GeminiAPIKey       string `envconfig:"GEMINI_API_KEY"`
	CORSAllowedOrigins string `envconfig:"CORS_ALLOWED_ORIGINS" default:"https://reader.abekoh.dev,http://localhost:5173,http://localhost:5174"`
	DisableAuth        bool   `envconfig:"DISABLE_AUTH" default:"false"`
}

func Load() *Config {
	var c Config
	if err := envconfig.Process("", &c); err != nil {
		panic(err)
	}
	return &c
}

type ctxKey struct{}

func WithConfig(ctx context.Context, cnf *Config) context.Context {
	return context.WithValue(ctx, ctxKey{}, cnf)
}

func FromContext(ctx context.Context) *Config {
	return ctx.Value(ctxKey{}).(*Config)
}
