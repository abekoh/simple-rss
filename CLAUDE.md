# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a full-stack RSS reader application with the following architecture:

### Backend (Go)
- **GraphQL API** using gqlgen with Auth0 JWT authentication
- **Database** using PostgreSQL with sqlc for type-safe queries
- **Background workers** for RSS feed processing:
  - FeedFetcher: Fetches RSS feeds
  - PostFetcher: Fetches individual posts
  - Summarizer: Generates AI summaries
  - Scheduler: Orchestrates the worker pipeline
- **Data flow**: FeedFetcher → PostFetcher → Summarizer

### Frontend (React + TypeScript)
- **React** with TypeScript and Vite for development
- **Routing** using TanStack Router
- **GraphQL client** using Apollo Client
- **UI components** using Chakra UI
- **Authentication** using Auth0 React SDK
- **PWA** capabilities with manifest and service worker

### Infrastructure
- **Containerization** using Docker
- **Database** running in Docker Compose for local development
- **Cloud deployment** using Google Cloud Platform with Terraform

## Common Development Commands

### Backend (Go)
```bash
# Run database
docker compose up -d
# Run the application
cd backend && go run .

# Generate code (GraphQL resolvers and SQL queries)
cd backend && go generate

# Run tests
cd backend && go test ./...

# Database migrations
cd backend && goose up

# Format
cd backend && go tool golang.org/x/tools/cmd/goimports -w ./...
```

### Frontend (React)
```bash
# Install dependencies
cd web && pnpm i

# Development server
cd web && pnpm dev

# Build for production
cd web && pnpm build

# Lint and fix code
cd web && pnpm lint
cd web && pnpm lint:fix

# Generate GraphQL type
cd web && pnpm codegen
```

### Docker Development
```bash
# Start local PostgreSQL database
docker-compose up -d

# Stop database
docker-compose down
```

## Code Generation

The project uses several code generation tools:

1. **gqlgen** (GraphQL): Generates resolvers and types from GraphQL schema
2. **sqlc** (SQL): Generates type-safe Go code from SQL queries
3. **GraphQL Codegen** (Frontend): Generates TypeScript types from GraphQL schema

When modifying GraphQL schemas or SQL queries, run the appropriate generation commands.

## Configuration

The backend uses environment variables for configuration (see `backend/lib/config/config.go`):
- Database URL
- Auth0 settings
- Google Gemini API key for summarization
- Port configuration

## Authentication

- Uses Auth0 for JWT-based authentication
- Mutations require "write" scope in JWT claims
- CORS configured for specific domains

## Before you commit...

- If you edit backend codes, you must run format command.