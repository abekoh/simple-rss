module github.com/abekoh/simple-rss/backend

go 1.24.2

tool (
	github.com/99designs/gqlgen
	github.com/pressly/goose/v3/cmd/goose
	github.com/sqlc-dev/sqlc/cmd/sqlc
	golang.org/x/tools/cmd/goimports
)

require (
	github.com/99designs/gqlgen v0.17.77
	github.com/PuerkitoBio/goquery v1.10.3
	github.com/auth0/go-jwt-middleware/v2 v2.3.0
	github.com/go-chi/chi/v5 v5.2.2
	github.com/go-chi/cors v1.2.2
	github.com/google/uuid v1.6.0
	github.com/graph-gophers/dataloader/v7 v7.1.0
	github.com/jackc/pgx/v5 v5.7.5
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/mmcdole/gofeed v1.3.0
	github.com/pressly/goose/v3 v3.24.3
	github.com/samber/lo v1.51.0
	github.com/vektah/gqlparser/v2 v2.5.30
	google.golang.org/genai v1.17.0
)

require (
	cel.dev/expr v0.23.1 // indirect
	cloud.google.com/go v0.116.0 // indirect
	cloud.google.com/go/auth v0.9.3 // indirect
	cloud.google.com/go/compute/metadata v0.6.0 // indirect
	filippo.io/edwards25519 v1.1.0 // indirect
	github.com/ClickHouse/ch-go v0.65.1 // indirect
	github.com/ClickHouse/clickhouse-go/v2 v2.34.0 // indirect
	github.com/agnivade/levenshtein v1.2.1 // indirect
	github.com/andybalholm/brotli v1.1.1 // indirect
	github.com/andybalholm/cascadia v1.3.3 // indirect
	github.com/antlr4-go/antlr/v4 v4.13.1 // indirect
	github.com/coder/websocket v1.8.13 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.7 // indirect
	github.com/cubicdaiya/gonp v1.0.4 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/dustin/go-humanize v1.0.1 // indirect
	github.com/elastic/go-sysinfo v1.15.3 // indirect
	github.com/elastic/go-windows v1.0.2 // indirect
	github.com/fatih/structtag v1.2.0 // indirect
	github.com/go-faster/city v1.0.1 // indirect
	github.com/go-faster/errors v0.7.1 // indirect
	github.com/go-sql-driver/mysql v1.9.2 // indirect
	github.com/go-viper/mapstructure/v2 v2.4.0 // indirect
	github.com/golang-jwt/jwt/v4 v4.5.2 // indirect
	github.com/golang-jwt/jwt/v5 v5.2.2 // indirect
	github.com/golang-sql/civil v0.0.0-20220223132316-b832511892a9 // indirect
	github.com/golang-sql/sqlexp v0.1.0 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/google/cel-go v0.25.0 // indirect
	github.com/google/go-cmp v0.7.0 // indirect
	github.com/google/s2a-go v0.1.8 // indirect
	github.com/googleapis/enterprise-certificate-proxy v0.3.4 // indirect
	github.com/gorilla/websocket v1.5.3 // indirect
	github.com/hashicorp/golang-lru/v2 v2.0.7 // indirect
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	github.com/jonboulle/clockwork v0.5.0 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/klauspost/compress v1.18.0 // indirect
	github.com/kr/pretty v0.3.1 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mfridman/interpolate v0.0.2 // indirect
	github.com/mfridman/xflag v0.1.0 // indirect
	github.com/microsoft/go-mssqldb v1.8.0 // indirect
	github.com/mmcdole/goxpp v1.1.1-0.20240225020742-a0c311522b23 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/ncruces/go-strftime v0.1.9 // indirect
	github.com/paulmach/orb v0.11.1 // indirect
	github.com/pganalyze/pg_query_go/v6 v6.1.0 // indirect
	github.com/pierrec/lz4/v4 v4.1.22 // indirect
	github.com/pingcap/errors v0.11.5-0.20240311024730-e056997136bb // indirect
	github.com/pingcap/failpoint v0.0.0-20240528011301-b51a646c7c86 // indirect
	github.com/pingcap/log v1.1.0 // indirect
	github.com/pingcap/tidb/pkg/parser v0.0.0-20250506013231-62d4284bee67 // indirect
	github.com/prometheus/procfs v0.16.1 // indirect
	github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec // indirect
	github.com/riza-io/grpc-go v0.2.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/segmentio/asm v1.2.0 // indirect
	github.com/sethvargo/go-retry v0.3.0 // indirect
	github.com/shopspring/decimal v1.4.0 // indirect
	github.com/sosodev/duration v1.3.1 // indirect
	github.com/spf13/cobra v1.9.1 // indirect
	github.com/spf13/pflag v1.0.6 // indirect
	github.com/sqlc-dev/sqlc v1.29.0 // indirect
	github.com/stoewer/go-strcase v1.3.0 // indirect
	github.com/tetratelabs/wazero v1.9.0 // indirect
	github.com/tursodatabase/libsql-client-go v0.0.0-20240902231107-85af5b9d094d // indirect
	github.com/urfave/cli/v2 v2.27.7 // indirect
	github.com/vertica/vertica-sql-go v1.3.3 // indirect
	github.com/wasilibs/go-pgquery v0.0.0-20250409022910-10ac41983c07 // indirect
	github.com/wasilibs/wazero-helpers v0.0.0-20250123031827-cd30c44769bb // indirect
	github.com/xrash/smetrics v0.0.0-20240521201337-686a1a2994c1 // indirect
	github.com/ydb-platform/ydb-go-genproto v0.0.0-20241112172322-ea1f63298f77 // indirect
	github.com/ydb-platform/ydb-go-sdk/v3 v3.108.1 // indirect
	github.com/ziutek/mymysql v1.5.4 // indirect
	go.opencensus.io v0.24.0 // indirect
	go.opentelemetry.io/otel v1.35.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v1.35.0 // indirect
	go.opentelemetry.io/otel/trace v1.35.0 // indirect
	go.uber.org/atomic v1.11.0 // indirect
	go.uber.org/multierr v1.11.0 // indirect
	go.uber.org/zap v1.27.0 // indirect
	golang.org/x/crypto v0.40.0 // indirect
	golang.org/x/exp v0.0.0-20250506013437-ce4c2cf36ca6 // indirect
	golang.org/x/mod v0.26.0 // indirect
	golang.org/x/net v0.42.0 // indirect
	golang.org/x/sync v0.16.0 // indirect
	golang.org/x/sys v0.34.0 // indirect
	golang.org/x/text v0.27.0 // indirect
	golang.org/x/tools v0.35.0 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20250505200425-f936aa4a68b2 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250505200425-f936aa4a68b2 // indirect
	google.golang.org/grpc v1.72.0 // indirect
	google.golang.org/protobuf v1.36.6 // indirect
	gopkg.in/go-jose/go-jose.v2 v2.6.3 // indirect
	gopkg.in/natefinch/lumberjack.v2 v2.2.1 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	howett.net/plist v1.0.1 // indirect
	modernc.org/libc v1.65.0 // indirect
	modernc.org/mathutil v1.7.1 // indirect
	modernc.org/memory v1.10.0 // indirect
	modernc.org/sqlite v1.37.0 // indirect
)
