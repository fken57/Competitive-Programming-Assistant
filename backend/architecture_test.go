package main

import (
	"fmt"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

func TestArchitectureDependencies(t *testing.T) {
	violations, err := architectureViolations(".")
	if err != nil {
		t.Fatal(err)
	}
	for _, violation := range violations {
		t.Error(violation)
	}
}

// Inspect production imports only. main.go is the composition root, and tests
// may use infrastructure implementations to exercise domain and usecase code.
func architectureViolations(root string) ([]string, error) {
	forbidden := map[string][]string{
		"domain": {
			"backend/internal/usecase", "backend/internal/handler", "backend/internal/infrastructure",
			"github.com/labstack/echo", "github.com/jmoiron/sqlx", "github.com/go-sql-driver/mysql", "database/sql",
		},
		"usecase":        {"backend/internal/handler", "backend/internal/infrastructure"},
		"handler":        {"backend/internal/infrastructure"},
		"infrastructure": {"backend/internal/handler", "backend/internal/usecase"},
	}
	internalDir := filepath.Join(root, "internal")
	var violations []string
	err := filepath.WalkDir(internalDir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".go") || strings.HasSuffix(entry.Name(), "_test.go") {
			return nil
		}
		relativePath, err := filepath.Rel(internalDir, path)
		if err != nil {
			return err
		}
		relativePath = filepath.ToSlash(relativePath)
		layer := strings.Split(relativePath, "/")[0]
		file, err := parser.ParseFile(token.NewFileSet(), path, nil, parser.ImportsOnly)
		if err != nil {
			return err
		}
		for _, imported := range file.Imports {
			dependency, err := strconv.Unquote(imported.Path.Value)
			if err != nil {
				return fmt.Errorf("%s: invalid import: %w", path, err)
			}
			for _, prefix := range forbidden[layer] {
				if dependency == prefix || strings.HasPrefix(dependency, prefix+"/") {
					violations = append(violations, fmt.Sprintf("internal/%s: %s must not import %s", relativePath, layer, dependency))
				}
			}
		}
		return nil
	})
	return violations, err
}

func TestArchitectureRules(t *testing.T) {
	tests := []struct {
		path       string
		dependency string
		forbidden  bool
	}{
		{"internal/domain/example.go", "backend/internal/usecase/array", true},
		{"internal/domain/example.go", "backend/internal/handler/array", true},
		{"internal/domain/example.go", "backend/internal/infrastructure/user", true},
		{"internal/domain/example.go", "github.com/labstack/echo/v4", true},
		{"internal/domain/example.go", "github.com/jmoiron/sqlx", true},
		{"internal/domain/example.go", "github.com/go-sql-driver/mysql", true},
		{"internal/domain/example.go", "database/sql", true},
		{"internal/domain/example.go", "database/sql/driver", true},
		{"internal/usecase/example.go", "backend/internal/handler/user", true},
		{"internal/usecase/example.go", "backend/internal/infrastructure/user", true},
		{"internal/handler/example.go", "backend/internal/infrastructure/user", true},
		{"internal/infrastructure/example.go", "backend/internal/handler/user", true},
		{"internal/infrastructure/example.go", "backend/internal/usecase/userusecase", true},
		{"internal/domain/example.go", "backend/internal/domain/array", false},
		{"internal/domain/example.go", "github.com/google/uuid", false},
		{"internal/domain/example.go", "golang.org/x/crypto/bcrypt", false},
		{"internal/domain/example.go", "backend/internal/usecaseish", false},
		{"internal/usecase/example.go", "backend/internal/domain/user", false},
		{"internal/handler/example.go", "backend/internal/domain/user", false},
		{"internal/handler/example.go", "backend/internal/usecase/userusecase", false},
		{"internal/handler/example.go", "backend/internal/handler/user", false},
		{"internal/infrastructure/example.go", "backend/internal/domain/user", false},
		{"internal/domain/example_test.go", "backend/internal/infrastructure/user", false},
		{"internal/domain/example.go.txt", "backend/internal/infrastructure/user", false},
		{"main.go", "backend/internal/infrastructure/user", false},
	}
	for _, test := range tests {
		t.Run(test.path+"/"+test.dependency, func(t *testing.T) {
			root := t.TempDir()
			if err := os.MkdirAll(filepath.Join(root, "internal"), 0o755); err != nil {
				t.Fatal(err)
			}
			path := filepath.Join(root, filepath.FromSlash(test.path))
			if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
				t.Fatal(err)
			}
			source := fmt.Sprintf("package example\nimport dependency %q\n", test.dependency)
			if err := os.WriteFile(path, []byte(source), 0o644); err != nil {
				t.Fatal(err)
			}
			violations, err := architectureViolations(root)
			if err != nil {
				t.Fatal(err)
			}
			want := 0
			if test.forbidden {
				want = 1
			}
			if len(violations) != want {
				t.Fatalf("violations = %v, want %d", violations, want)
			}
			if want == 1 && (!strings.Contains(violations[0], test.path) || !strings.Contains(violations[0], test.dependency)) {
				t.Fatalf("violation must identify the source file and dependency: %s", violations[0])
			}
		})
	}
}
