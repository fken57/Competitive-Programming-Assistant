package randomgen

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	usecase "backend/internal/usecase/randomgen"

	"github.com/labstack/echo/v4"
)

func TestGenerateReturnsReproducibleInputAndRecipe(t *testing.T) {
	body := `{
		"recipe": {
			"generatorVersion": "0.1.0",
			"rngAlgorithm": "splitmix64-v1",
			"seed": "123",
			"structureType": "array",
			"caseType": "all_same",
			"params": {"N": 3, "minValue": 7, "maxValue": 7},
			"outputFormat": {"indexBase": 1, "hasT": false, "lineBreakStyle": "lf"}
		}
	}`
	echoServer := echo.New()
	handler := NewRandomGenHandler(usecase.NewRandomGenUsecase())
	request := httptest.NewRequest(http.MethodPost, "/apis/random-gen/generate", strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()

	if err := handler.Generate(echoServer.NewContext(request, recorder)); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), `"inputText":"3\n7 7 7\n"`) {
		t.Fatalf("unexpected body: %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), `"seed":"123"`) {
		t.Fatalf("recipe was not returned: %s", recorder.Body.String())
	}
}

func TestGenerateRejectsImpossibleGraph(t *testing.T) {
	body := `{
		"recipe": {
			"generatorVersion": "0.1.0",
			"rngAlgorithm": "splitmix64-v1",
			"seed": "123",
			"structureType": "graph",
			"caseType": "random_dense",
			"params": {
				"N": 5, "M": 100, "directed": false, "connected": false,
				"allowSelfLoop": false, "allowMultiEdge": false, "weighted": false
			},
			"outputFormat": {"indexBase": 1, "hasT": false, "lineBreakStyle": "lf"}
		}
	}`
	echoServer := echo.New()
	handler := NewRandomGenHandler(usecase.NewRandomGenUsecase())
	request := httptest.NewRequest(http.MethodPost, "/apis/random-gen/generate", strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()

	if err := handler.Generate(echoServer.NewContext(request, recorder)); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "at most M=10") {
		t.Fatalf("unexpected error: %s", recorder.Body.String())
	}
}
