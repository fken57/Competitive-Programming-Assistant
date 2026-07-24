package main

import (
	"fmt"
	"net"
	"net/url"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

func openDatabase(config appConfig) (*sqlx.DB, error) {
	dsn, err := mariaDBDSN(config)
	if err != nil {
		return nil, err
	}
	if dsn == "" {
		return nil, nil
	}
	db, err := sqlx.Connect("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("connect to MariaDB: %w", err)
	}
	return db, nil
}

func mariaDBDSN(config appConfig) (string, error) {
	if config.DatabaseURL != "" {
		return normalizeMariaDBURL(config.DatabaseURL)
	}
	if !config.hasCompleteDatabaseSettings() {
		return "", nil
	}
	return normalizedMySQLConfig(mysql.Config{
		User:      config.DatabaseUser,
		Passwd:    config.DatabasePass,
		Net:       "tcp",
		Addr:      net.JoinHostPort(config.DatabaseHost, config.DatabasePort),
		DBName:    config.DatabaseName,
		TLSConfig: config.DatabaseTLS,
	}).FormatDSN(), nil
}

func normalizeMariaDBURL(raw string) (string, error) {
	if !strings.Contains(raw, "://") {
		config, err := mysql.ParseDSN(raw)
		if err != nil {
			return "", fmt.Errorf("parse DATABASE_URL as MariaDB DSN: %w", err)
		}
		return normalizedMySQLConfig(*config).FormatDSN(), nil
	}

	parsed, err := url.Parse(raw)
	if err != nil {
		return "", fmt.Errorf("parse DATABASE_URL: %w", err)
	}
	if parsed.Scheme != "mysql" && parsed.Scheme != "mariadb" {
		return "", fmt.Errorf("DATABASE_URL scheme must be mysql or mariadb")
	}
	password, _ := parsed.User.Password()
	databaseName := strings.TrimPrefix(parsed.EscapedPath(), "/")
	databaseName, err = url.PathUnescape(databaseName)
	if err != nil {
		return "", fmt.Errorf("decode database name: %w", err)
	}
	if parsed.User.Username() == "" || parsed.Hostname() == "" || databaseName == "" {
		return "", fmt.Errorf("DATABASE_URL must include user, host, and database name")
	}
	port := parsed.Port()
	if port == "" {
		port = "3306"
	}
	return normalizedMySQLConfig(mysql.Config{
		User:      parsed.User.Username(),
		Passwd:    password,
		Net:       "tcp",
		Addr:      net.JoinHostPort(parsed.Hostname(), port),
		DBName:    databaseName,
		TLSConfig: parsed.Query().Get("tls"),
	}).FormatDSN(), nil
}

func normalizedMySQLConfig(config mysql.Config) *mysql.Config {
	config.ParseTime = true
	config.Loc = time.UTC
	config.MultiStatements = false
	config.Collation = "utf8mb4_unicode_ci"
	config.Timeout = 5 * time.Second
	config.ReadTimeout = 10 * time.Second
	config.WriteTimeout = 10 * time.Second
	if config.Params == nil {
		config.Params = make(map[string]string)
	}
	config.Params["charset"] = "utf8mb4"
	return &config
}
