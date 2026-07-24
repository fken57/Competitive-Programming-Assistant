package main

import (
	"context"
	"os"
	"testing"

	"github.com/jmoiron/sqlx"
)

func TestMariaDBMigrationsIntegration(t *testing.T) {
	dsn := os.Getenv("MARIADB_TEST_DSN")
	if dsn == "" {
		t.Skip("MARIADB_TEST_DSN is not set")
	}

	db, err := openDatabase(appConfig{DatabaseURL: dsn})
	if err != nil {
		t.Fatalf("connect to MariaDB: %v", err)
	}
	defer db.Close()

	for attempt := 0; attempt < 2; attempt++ {
		if err := runMigrations(context.Background(), db); err != nil {
			t.Fatalf("run migrations attempt %d: %v", attempt+1, err)
		}
	}

	assertDatabaseCount(t, db, 5,
		"SELECT COUNT(*) FROM schema_migrations",
	)
	assertDatabaseCount(t, db, 5, `SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE()
		AND table_name IN ('users', 'user_sessions', 'generation_histories', 'killed_cases', 'generator_presets')`,
	)
	assertDatabaseCount(t, db, 3, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND column_name = 'seed'
		AND table_name IN ('generation_histories', 'killed_cases', 'generator_presets')`,
	)
	assertDatabaseCount(t, db, 3, `SELECT COUNT(*) FROM information_schema.statistics
		WHERE table_schema = DATABASE()
		AND index_name IN ('generation_histories_seed_idx', 'killed_cases_seed_idx', 'generator_presets_seed_idx')`,
	)

	var contains int
	if err := db.Get(
		&contains,
		"SELECT JSON_CONTAINS(JSON_ARRAY('wa', 'tle'), JSON_QUOTE(?), '$')",
		"tle",
	); err != nil {
		t.Fatalf("execute JSON tag lookup: %v", err)
	}
	if contains != 1 {
		t.Fatalf("expected JSON tag lookup to match, got %d", contains)
	}
}

func assertDatabaseCount(t *testing.T, db *sqlx.DB, want int, query string) {
	t.Helper()
	var got int
	if err := db.Get(&got, query); err != nil {
		t.Fatalf("query database metadata: %v", err)
	}
	if got != want {
		t.Fatalf("unexpected database metadata count: got %d, want %d", got, want)
	}
}
