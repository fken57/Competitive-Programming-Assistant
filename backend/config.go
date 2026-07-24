package main

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

const productionEnvironment = "production"

type appConfig struct {
	AppEnvironment string
	DatabaseURL    string
	DatabaseHost   string
	DatabasePort   string
	DatabaseName   string
	DatabaseUser   string
	DatabasePass   string
	DatabaseTLS    string
	FrontendOrigin string
	Port           string
	StaticDir      string
	Debug          bool
}

func loadConfig() (appConfig, error) {
	config := appConfig{
		AppEnvironment: environmentOrDefault("APP_ENV", "development"),
		DatabaseURL:    strings.TrimSpace(os.Getenv("DATABASE_URL")),
		DatabaseHost:   firstEnvironment("NS_MARIADB_HOSTNAME", "MARIADB_HOST", "MYSQL_HOST", "DB_HOST"),
		DatabasePort:   firstEnvironment("NS_MARIADB_PORT", "MARIADB_PORT", "MYSQL_PORT", "DB_PORT"),
		DatabaseName:   firstEnvironment("NS_MARIADB_DATABASE", "MARIADB_DATABASE", "MYSQL_DATABASE", "DB_NAME"),
		DatabaseUser:   firstEnvironment("NS_MARIADB_USER", "MARIADB_USER", "MYSQL_USER", "DB_USER"),
		DatabasePass:   firstEnvironment("NS_MARIADB_PASSWORD", "MARIADB_PASSWORD", "MYSQL_PASSWORD", "DB_PASSWORD"),
		DatabaseTLS:    firstEnvironment("MARIADB_TLS", "MYSQL_TLS", "DB_TLS"),
		FrontendOrigin: strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN")),
		Port:           environmentOrDefault("PORT", "8080"),
		StaticDir:      strings.TrimSpace(os.Getenv("STATIC_DIR")),
	}
	if config.DatabasePort == "" {
		config.DatabasePort = "3306"
	}
	isProduction := config.AppEnvironment == productionEnvironment
	config.Debug = !isProduction && strings.EqualFold(os.Getenv("DEBUG"), "true")

	port, err := strconv.Atoi(config.Port)
	if err != nil || port < 1 || port > 65535 {
		return appConfig{}, fmt.Errorf("PORT must be an integer between 1 and 65535")
	}

	if config.FrontendOrigin == "" {
		if isProduction {
			return appConfig{}, fmt.Errorf("FRONTEND_ORIGIN is required in production")
		}
		config.FrontendOrigin = "http://localhost:3000"
	}
	if err := validateOrigin(config.FrontendOrigin); err != nil {
		return appConfig{}, fmt.Errorf("invalid FRONTEND_ORIGIN: %w", err)
	}

	if config.DatabaseURL == "" && config.hasPartialDatabaseSettings() && !config.hasCompleteDatabaseSettings() {
		return appConfig{}, fmt.Errorf("MariaDB settings require host, database, user, and password")
	}
	if isProduction && config.DatabaseURL == "" && !config.hasCompleteDatabaseSettings() {
		return appConfig{}, fmt.Errorf("DATABASE_URL or complete MariaDB settings are required in production")
	}

	return config, nil
}

func (config appConfig) hasPartialDatabaseSettings() bool {
	return config.DatabaseHost != "" || config.DatabaseName != "" ||
		config.DatabaseUser != "" || config.DatabasePass != "" || config.DatabaseTLS != ""
}

func (config appConfig) hasCompleteDatabaseSettings() bool {
	return config.DatabaseHost != "" && config.DatabaseName != "" &&
		config.DatabaseUser != "" && config.DatabasePass != ""
}

func validateOrigin(value string) error {
	if strings.Contains(value, "*") {
		return fmt.Errorf("wildcards are not allowed")
	}
	parsed, err := url.Parse(value)
	if err != nil {
		return err
	}
	if (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return fmt.Errorf("must be an absolute http or https URL")
	}
	if parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" || parsed.User != nil {
		return fmt.Errorf("must contain only scheme and host")
	}
	return nil
}

func environmentOrDefault(name, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(name)); value != "" {
		return value
	}
	return fallback
}

func firstEnvironment(names ...string) string {
	for _, name := range names {
		if value := strings.TrimSpace(os.Getenv(name)); value != "" {
			return value
		}
	}
	return ""
}
