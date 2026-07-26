package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestRegisterStaticFrontend(t *testing.T) {
	staticDir := t.TempDir()
	writeStaticTestFile(t, staticDir, "index.html", "react-index")
	writeStaticTestFile(t, staticDir, "assets/app.js", "application-javascript")

	tests := []struct {
		name             string
		path             string
		wantStatus       int
		wantBody         string
		unwantedBodyPart string
	}{
		{
			name:       "serves the React entry point at the root",
			path:       "/",
			wantStatus: http.StatusOK,
			wantBody:   "react-index",
		},
		{
			name:       "falls back to React for a known page deep link",
			path:       "/array",
			wantStatus: http.StatusOK,
			wantBody:   "react-index",
		},
		{
			name:       "falls back to React so an unknown page can render NotFound",
			path:       "/unknown/nested-page",
			wantStatus: http.StatusOK,
			wantBody:   "react-index",
		},
		{
			name:       "falls back to React for an HTML route containing a dot",
			path:       "/users/john.doe",
			wantStatus: http.StatusOK,
			wantBody:   "react-index",
		},
		{
			name:       "serves an existing static asset",
			path:       "/assets/app.js",
			wantStatus: http.StatusOK,
			wantBody:   "application-javascript",
		},
		{
			name:             "does not turn an unknown API route into HTML",
			path:             "/apis/does-not-exist",
			wantStatus:       http.StatusNotFound,
			unwantedBodyPart: "react-index",
		},
		{
			name:             "does not turn a missing asset into HTML",
			path:             "/assets/missing.js",
			wantStatus:       http.StatusNotFound,
			unwantedBodyPart: "react-index",
		},
		{
			name:             "does not turn an extensionless asset into HTML",
			path:             "/static/media/missing",
			wantStatus:       http.StatusNotFound,
			unwantedBodyPart: "react-index",
		},
		{
			name:             "rejects backslash paths",
			path:             `/..\outside.txt`,
			wantStatus:       http.StatusNotFound,
			unwantedBodyPart: "react-index",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			server := echo.New()
			registerStaticFrontend(server, staticDir)

			request := httptest.NewRequest(http.MethodGet, test.path, nil)
			request.Header.Set(echo.HeaderAccept, echo.MIMETextHTML)
			recorder := httptest.NewRecorder()
			server.ServeHTTP(recorder, request)

			if recorder.Code != test.wantStatus {
				t.Fatalf("GET %s status = %d, want %d", test.path, recorder.Code, test.wantStatus)
			}
			if test.wantBody != "" && recorder.Body.String() != test.wantBody {
				t.Fatalf("GET %s body = %q, want %q", test.path, recorder.Body.String(), test.wantBody)
			}
			if test.unwantedBodyPart != "" && strings.Contains(recorder.Body.String(), test.unwantedBodyPart) {
				t.Fatalf("GET %s unexpectedly returned the React entry point", test.path)
			}
		})
	}
}

func TestRegisterStaticFrontendDoesNotFollowSymlinksOutsideRoot(t *testing.T) {
	parentDir := t.TempDir()
	staticDir := filepath.Join(parentDir, "static")
	if err := os.MkdirAll(staticDir, 0o755); err != nil {
		t.Fatal(err)
	}
	writeStaticTestFile(t, staticDir, "index.html", "react-index")
	outsidePath := filepath.Join(parentDir, "outside.txt")
	if err := os.WriteFile(outsidePath, []byte("private"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(outsidePath, filepath.Join(staticDir, "linked.txt")); err != nil {
		t.Skipf("symlinks are unavailable: %v", err)
	}

	server := echo.New()
	registerStaticFrontend(server, staticDir)
	request := httptest.NewRequest(http.MethodGet, "/linked.txt", nil)
	recorder := httptest.NewRecorder()
	server.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound || strings.Contains(recorder.Body.String(), "private") {
		t.Fatalf("GET /linked.txt status = %d, body = %q", recorder.Code, recorder.Body.String())
	}
}

func TestRegisterStaticFrontendDoesNothingWithoutStaticDirectory(t *testing.T) {
	server := echo.New()
	registerStaticFrontend(server, "")

	request := httptest.NewRequest(http.MethodGet, "/array", nil)
	recorder := httptest.NewRecorder()
	server.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("GET /array status = %d, want %d", recorder.Code, http.StatusNotFound)
	}
}

func writeStaticTestFile(t *testing.T, root string, name string, contents string) {
	t.Helper()

	path := filepath.Join(root, name)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("create static test directory: %v", err)
	}
	if err := os.WriteFile(path, []byte(contents), 0o644); err != nil {
		t.Fatalf("write static test file: %v", err)
	}
}
