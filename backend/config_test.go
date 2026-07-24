package main

import "testing"

func TestLoadConfigRequiresProductionSettings(t *testing.T) {
	clearDatabaseEnvironment(t)
	t.Setenv("APP_ENV", productionEnvironment)
	t.Setenv("FRONTEND_ORIGIN", "")

	if _, err := loadConfig(); err == nil {
		t.Fatal("expected production config without required settings to fail")
	}
}

func TestLoadConfigDisablesProductionDebug(t *testing.T) {
	clearDatabaseEnvironment(t)
	t.Setenv("APP_ENV", productionEnvironment)
	t.Setenv("DATABASE_URL", "mariadb://user:password@db:3306/cpa")
	t.Setenv("FRONTEND_ORIGIN", "https://cpa.trap.games")
	t.Setenv("DEBUG", "true")

	config, err := loadConfig()
	if err != nil {
		t.Fatalf("loadConfig returned an error: %v", err)
	}
	if config.Debug {
		t.Fatal("debug must remain disabled in production")
	}
}

func TestLoadConfigRejectsWildcardOrigin(t *testing.T) {
	clearDatabaseEnvironment(t)
	t.Setenv("FRONTEND_ORIGIN", "https://*.trap.games")

	if _, err := loadConfig(); err == nil {
		t.Fatal("expected wildcard origin to be rejected")
	}
}

func TestLoadConfigUsesDevelopmentDefaults(t *testing.T) {
	clearDatabaseEnvironment(t)
	t.Setenv("APP_ENV", "")
	t.Setenv("FRONTEND_ORIGIN", "")
	t.Setenv("PORT", "")

	config, err := loadConfig()
	if err != nil {
		t.Fatalf("loadConfig returned an error: %v", err)
	}
	if config.Port != "8080" || config.FrontendOrigin != "http://localhost:3000" {
		t.Fatalf("unexpected defaults: %#v", config)
	}
}

func TestLoadConfigAcceptsMariaDBComponents(t *testing.T) {
	clearDatabaseEnvironment(t)
	t.Setenv("APP_ENV", productionEnvironment)
	t.Setenv("FRONTEND_ORIGIN", "https://cpa.trap.games")
	t.Setenv("MARIADB_HOST", "mariadb")
	t.Setenv("MARIADB_DATABASE", "cpa")
	t.Setenv("MARIADB_USER", "cpa")
	t.Setenv("MARIADB_PASSWORD", "secret")

	config, err := loadConfig()
	if err != nil {
		t.Fatalf("loadConfig returned an error: %v", err)
	}
	if config.DatabasePort != "3306" || !config.hasCompleteDatabaseSettings() {
		t.Fatalf("unexpected MariaDB config: %#v", config)
	}
}

func clearDatabaseEnvironment(t *testing.T) {
	t.Helper()
	for _, name := range []string{
		"DATABASE_URL",
		"MARIADB_HOST", "MYSQL_HOST", "DB_HOST",
		"MARIADB_PORT", "MYSQL_PORT", "DB_PORT",
		"MARIADB_DATABASE", "MYSQL_DATABASE", "DB_NAME",
		"MARIADB_USER", "MYSQL_USER", "DB_USER",
		"MARIADB_PASSWORD", "MYSQL_PASSWORD", "DB_PASSWORD",
		"MARIADB_TLS", "MYSQL_TLS", "DB_TLS",
	} {
		t.Setenv(name, "")
	}
}
