package handler

import (
	graphrepo "backend/internal/infrastructure/weightedgraph"
	graphusecase "backend/internal/usecase/weightedgraph"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestAnalyzeUnorderedStaticReturnsPrimAndTreeDiameterStatus(t *testing.T) {
	useCase := graphusecase.NewCostGraphUseCase(graphrepo.NewCostGraphFakeRepository(nil))
	handler := NewCostGraphHandler(useCase)
	server := echo.New()
	body := `{"vertex_count":3,"neighbors":[[{"to":1,"weight":2}],[{"to":0,"weight":2}],[]]}`
	request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()
	if err := handler.AnalyzeUnorderedStatic(server.NewContext(request, recorder)); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	var response StaticAnalysisResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if len(response.Results) != 2 || response.Results[0].ID != "prim" || response.Results[1].Status != "skipped" {
		t.Fatalf("results = %#v", response.Results)
	}
}
