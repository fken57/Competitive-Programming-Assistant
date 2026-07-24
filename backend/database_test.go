package main

import (
	"strings"
	"testing"
	"time"

	"github.com/go-sql-driver/mysql"
)

func TestMariaDBDSNFromURL(t *testing.T) {
	dsn, err := mariaDBDSN(appConfig{
		DatabaseURL: "mariadb://cpa:p%40ss@db.example:3307/cpa_prod?tls=true",
	})
	if err != nil {
		t.Fatalf("mariaDBDSN returned an error: %v", err)
	}
	assertNormalizedDSN(t, dsn, "cpa", "p@ss", "db.example:3307", "cpa_prod", "true")
}

func TestMariaDBDSNFromComponents(t *testing.T) {
	dsn, err := mariaDBDSN(appConfig{
		DatabaseHost: "mariadb",
		DatabasePort: "3306",
		DatabaseName: "cpa",
		DatabaseUser: "app",
		DatabasePass: "secret",
	})
	if err != nil {
		t.Fatalf("mariaDBDSN returned an error: %v", err)
	}
	assertNormalizedDSN(t, dsn, "app", "secret", "mariadb:3306", "cpa", "")
}

func TestMariaDBDSNRejectsPostgresURL(t *testing.T) {
	_, err := mariaDBDSN(appConfig{
		DatabaseURL: "postgres://user:password@db:5432/cpa",
	})
	if err == nil {
		t.Fatal("expected a PostgreSQL URL to be rejected")
	}
}

func assertNormalizedDSN(
	t *testing.T,
	dsn string,
	user string,
	password string,
	address string,
	databaseName string,
	tlsConfig string,
) {
	t.Helper()
	config, err := mysql.ParseDSN(dsn)
	if err != nil {
		t.Fatalf("generated DSN is invalid: %v", err)
	}
	if config.User != user || config.Passwd != password || config.Addr != address ||
		config.DBName != databaseName || config.TLSConfig != tlsConfig {
		t.Fatalf("unexpected DSN config: %#v", config)
	}
	if !config.ParseTime || config.Loc != time.UTC || config.MultiStatements ||
		!config.AllowNativePasswords {
		t.Fatalf("unsafe time or multi-statement settings: %#v", config)
	}
	if !strings.Contains(dsn, "charset=utf8mb4") || config.Collation != "utf8mb4_unicode_ci" {
		t.Fatalf("unexpected character settings: %#v", config)
	}
}
