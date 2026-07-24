package main

import "testing"

func TestLoadConfigRequiresProductionSettings(t *testing.T) {
	t.Setenv("APP_ENV", productionEnvironment)
	t.Setenv("DATABASE_URL", "")
	t.Setenv("FRONTEND_ORIGIN", "")

	if _, err := loadConfig(); err == nil {
		t.Fatal("expected production config without required settings to fail")
	}
}

func TestLoadConfigDisablesProductionDebug(t *testing.T) {
	t.Setenv("APP_ENV", productionEnvironment)
	t.Setenv("DATABASE_URL", "postgres://user:password@db:5432/cpa")
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
	t.Setenv("FRONTEND_ORIGIN", "https://*.trap.games")

	if _, err := loadConfig(); err == nil {
		t.Fatal("expected wildcard origin to be rejected")
	}
}

func TestLoadConfigUsesDevelopmentDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "")
	t.Setenv("DATABASE_URL", "")
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
