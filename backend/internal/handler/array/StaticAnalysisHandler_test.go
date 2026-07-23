package handler

import (
	arrayusecase "backend/internal/usecase/array"
	"net/http"
	"testing"
)

func TestAnalyzeStaticReturnsAllEightArrayAlgorithms(t *testing.T) {
	handler := NewArrayHandler(arrayusecase.NewArrayUseCase())
	recorder, response := executeRequest(t, handler.AnalyzeStatic, `{"values":[3,1,2,1]}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	results, ok := response["results"].([]interface{})
	if !ok || len(results) != 8 {
		t.Fatalf("results = %#v, want 8 items", response["results"])
	}
}
