package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
)

func registerStaticFrontend(server *echo.Echo, staticDir string) {
	if staticDir == "" {
		return
	}

	server.GET("/*", func(context echo.Context) error {
		requestPath := strings.TrimPrefix(filepath.Clean("/"+context.Param("*")), string(filepath.Separator))
		if requestPath != "" {
			fullPath := filepath.Join(staticDir, requestPath)
			if info, err := os.Stat(fullPath); err == nil && !info.IsDir() {
				return context.File(fullPath)
			}
		}
		return context.File(filepath.Join(staticDir, "index.html"))
	})
}
