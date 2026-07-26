package main

import (
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
)

func registerStaticFrontend(server *echo.Echo, staticDir string) {
	if staticDir == "" {
		return
	}
	staticRoot, err := filepath.Abs(staticDir)
	if err != nil {
		return
	}

	server.GET("/*", func(context echo.Context) error {
		rawPath := context.Param("*")
		if strings.Contains(rawPath, `\`) {
			return echo.ErrNotFound
		}
		requestPath := strings.TrimPrefix(path.Clean("/"+rawPath), "/")
		if requestPath == "apis" || strings.HasPrefix(requestPath, "apis/") {
			return echo.ErrNotFound
		}

		if requestPath != "" {
			if fullPath, exists := staticFileWithinRoot(staticRoot, requestPath); exists {
				return context.File(fullPath)
			}

			if isStaticAssetPath(requestPath, context.Request().Header.Get(echo.HeaderAccept)) {
				return echo.ErrNotFound
			}
		}

		indexPath, exists := staticFileWithinRoot(staticRoot, "index.html")
		if !exists {
			return echo.ErrNotFound
		}
		return context.File(indexPath)
	})
}

func staticFileWithinRoot(staticRoot string, requestPath string) (string, bool) {
	fullPath := filepath.Join(staticRoot, filepath.FromSlash(requestPath))
	relativePath, err := filepath.Rel(staticRoot, fullPath)
	if err != nil || filepath.IsAbs(relativePath) || relativePath == ".." ||
		strings.HasPrefix(relativePath, ".."+string(filepath.Separator)) {
		return "", false
	}
	currentPath := staticRoot
	for _, segment := range strings.Split(relativePath, string(filepath.Separator)) {
		currentPath = filepath.Join(currentPath, segment)
		info, err := os.Lstat(currentPath)
		if err != nil || info.Mode()&os.ModeSymlink != 0 {
			return "", false
		}
	}
	info, err := os.Stat(fullPath)
	if err != nil || info.IsDir() {
		return "", false
	}
	return fullPath, true
}

func isStaticAssetPath(requestPath string, acceptHeader string) bool {
	for _, prefix := range []string{"assets/", "images/", "static/"} {
		if strings.HasPrefix(requestPath, prefix) {
			return true
		}
	}
	for _, fileName := range []string{
		"asset-manifest.json", "favicon.ico", "logo192.png", "logo512.png",
		"manifest.json", "robots.txt", "service-worker.js",
	} {
		if requestPath == fileName {
			return true
		}
	}
	return filepath.Ext(requestPath) != "" && !strings.Contains(acceptHeader, echo.MIMETextHTML)
}
