package handler

import (
	graphrepo "backend/internal/infrastructure/unweightedgraph"
	graphusecase "backend/internal/usecase/unweightedgraph"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func executeStaticRequest(t *testing.T, handle echo.HandlerFunc, body string) map[string]interface{} {
	t.Helper()
	server := echo.New()
	request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()
	if err := handle(server.NewContext(request, recorder)); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	var response map[string]interface{}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	return response
}

func TestAnalyzeUnorderedStaticSkipsTreeDistanceForNonTree(t *testing.T) {
	useCase := graphusecase.NewNoCostGraphUseCase(graphrepo.NewGraphFakeRepository(nil))
	handler := NewNoCostGraphHandler(useCase)
	response := executeStaticRequest(t, handler.AnalyzeUnorderedStatic, `{"vertex_count":3,"neighbors":[[1],[0],[]]}`)
	results := response["results"].([]interface{})
	if len(results) != 6 {
		t.Fatalf("results count = %d, want 6", len(results))
	}
	last := results[len(results)-1].(map[string]interface{})
	if last["id"] != "tree_distance" || last["status"] != "skipped" {
		t.Fatalf("last result = %#v", last)
	}
}

func TestAnalyzeOrderedStaticDoesNotIncludeTraversalQueries(t *testing.T) {
	useCase := graphusecase.NewNoCostGraphUseCase(graphrepo.NewGraphFakeRepository(nil))
	handler := NewNoCostGraphHandler(useCase)
	response := executeStaticRequest(t, handler.AnalyzeOrderedStatic, `{"vertex_count":3,"neighbors":[[1],[2],[]]}`)
	results := response["results"].([]interface{})
	if len(results) != 3 {
		t.Fatalf("results count = %d, want 3", len(results))
	}
}
