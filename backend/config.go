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
	FrontendOrigin string
	Port           string
	StaticDir      string
	Debug          bool
}

func loadConfig() (appConfig, error) {
	config := appConfig{
		AppEnvironment: environmentOrDefault("APP_ENV", "development"),
		DatabaseURL:    strings.TrimSpace(os.Getenv("DATABASE_URL")),
		FrontendOrigin: strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN")),
		Port:           environmentOrDefault("PORT", "8080"),
		StaticDir:      strings.TrimSpace(os.Getenv("STATIC_DIR")),
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

	if isProduction && config.DatabaseURL == "" {
		return appConfig{}, fmt.Errorf("DATABASE_URL is required in production")
	}

	return config, nil
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
