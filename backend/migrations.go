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

	transaction, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin migration transaction: %w", err)
	}
	defer transaction.Rollback()

	if _, err := transaction.ExecContext(ctx, "SELECT pg_advisory_xact_lock($1)", int64(0x435041)); err != nil {
		return fmt.Errorf("lock migrations: %w", err)
	}
	if _, err := transaction.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		version TEXT PRIMARY KEY,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`); err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() || path.Ext(entry.Name()) != ".sql" {
			continue
		}
		version := strings.TrimSuffix(entry.Name(), ".sql")
		var applied bool
		if err := transaction.GetContext(
			ctx,
			&applied,
			"SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)",
			version,
		); err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if applied {
			continue
		}

		content, err := migrationFiles.ReadFile(path.Join("migrations", entry.Name()))
		if err != nil {
			return fmt.Errorf("read migration %s: %w", version, err)
		}
		if _, err := transaction.ExecContext(ctx, string(content)); err != nil {
			return fmt.Errorf("apply migration %s: %w", version, err)
		}
		if _, err := transaction.ExecContext(
			ctx,
			"INSERT INTO schema_migrations (version) VALUES ($1)",
			version,
		); err != nil {
			return fmt.Errorf("record migration %s: %w", version, err)
		}
	}

	if err := transaction.Commit(); err != nil {
		return fmt.Errorf("commit migrations: %w", err)
	}
	return nil
}
