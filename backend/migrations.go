package main

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"path"
	"sort"
	"strings"

	"github.com/jmoiron/sqlx"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

func runMigrations(ctx context.Context, db *sqlx.DB) error {
	entries, err := fs.ReadDir(migrationFiles, "migrations")
	if err != nil {
		return fmt.Errorf("read migrations: %w", err)
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() < entries[j].Name() })

	connection, err := db.Connx(ctx)
	if err != nil {
		return fmt.Errorf("reserve migration connection: %w", err)
	}
	defer connection.Close()

	const lockName = "cpa_schema_migrations"
	var lockAcquired int
	if err := connection.GetContext(ctx, &lockAcquired, "SELECT GET_LOCK(?, 30)", lockName); err != nil {
		return fmt.Errorf("lock migrations: %w", err)
	}
	if lockAcquired != 1 {
		return fmt.Errorf("lock migrations: timed out")
	}
	defer func() {
		var released int
		_ = connection.GetContext(context.Background(), &released, "SELECT RELEASE_LOCK(?)", lockName)
	}()

	if _, err := connection.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
		applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
	)`); err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() || path.Ext(entry.Name()) != ".sql" {
			continue
		}
		version := strings.TrimSuffix(entry.Name(), ".sql")
		var applied int
		if err := connection.GetContext(
			ctx,
			&applied,
			"SELECT COUNT(*) FROM schema_migrations WHERE version = ?",
			version,
		); err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if applied > 0 {
			continue
		}

		content, err := migrationFiles.ReadFile(path.Join("migrations", entry.Name()))
		if err != nil {
			return fmt.Errorf("read migration %s: %w", version, err)
		}
		if _, err := connection.ExecContext(ctx, string(content)); err != nil {
			return fmt.Errorf("apply migration %s: %w", version, err)
		}
		if _, err := connection.ExecContext(
			ctx,
			"INSERT INTO schema_migrations (version) VALUES (?)",
			version,
		); err != nil {
			return fmt.Errorf("record migration %s: %w", version, err)
		}
	}

	return nil
}
