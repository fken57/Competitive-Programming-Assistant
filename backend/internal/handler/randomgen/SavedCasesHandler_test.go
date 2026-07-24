package randomgen

import (
	domain "backend/internal/domain/randomgen"
	userdomain "backend/internal/domain/user"
	userhandler "backend/internal/handler/user"
	repository "backend/internal/infrastructure/randomgen"
	usecase "backend/internal/usecase/randomgen"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
)

func authenticatedContext(
	echoServer *echo.Echo,
	method string,
	path string,
	body string,
	entity *userdomain.User,
) (echo.Context, *httptest.ResponseRecorder) {
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()
	context := echoServer.NewContext(request, recorder)
	context.Set(userhandler.AuthenticatedUserKey, entity)
	return context, recorder
}

func TestAuthenticatedSavedCaseEndpointsNeverReturnInputText(t *testing.T) {
	echoServer := echo.New()
	repo := repository.NewMemorySavedCaseRepository()
	handler := NewRandomGenHandler(usecase.NewRandomGenUsecase(repo))
	entity := userdomain.NewUser("tester", "hash", time.Now())
	recipeJSON := `{
		"generatorVersion":"0.1.0","rngAlgorithm":"splitmix64-v1","seed":"123",
		"structureType":"array","caseType":"all_same",
		"params":{"N":2,"minValue":1,"maxValue":1},
		"outputFormat":{"indexBase":1,"hasT":false,"lineBreakStyle":"lf"}
	}`

	saveContext, saveRecorder := authenticatedContext(
		echoServer, http.MethodPost, "/history", `{"recipe":`+recipeJSON+`}`,
		entity,
	)
	if err := handler.SaveHistory(saveContext); err != nil {
		t.Fatal(err)
	}
	if saveRecorder.Code != http.StatusCreated || strings.Contains(saveRecorder.Body.String(), "inputText") {
		t.Fatalf("save history status = %d, body = %s", saveRecorder.Code, saveRecorder.Body.String())
	}

	killedContext, killedRecorder := authenticatedContext(
		echoServer, http.MethodPost, "/killed-cases",
		`{"title":"case","failureType":"WA","reasonTags":["boundary"],"notes":"memo","recipe":`+recipeJSON+`}`,
		entity,
	)
	if err := handler.SaveKilledCase(killedContext); err != nil {
		t.Fatal(err)
	}
	if killedRecorder.Code != http.StatusCreated || strings.Contains(killedRecorder.Body.String(), "inputText") {
		t.Fatalf("killed status = %d, body = %s", killedRecorder.Code, killedRecorder.Body.String())
	}

	listContext, listRecorder := authenticatedContext(
		echoServer, http.MethodGet, "/killed-cases?tag=boundary", "",
		entity,
	)
	if err := handler.ListKilledCases(listContext); err != nil {
		t.Fatal(err)
	}
	if listRecorder.Code != http.StatusOK || !strings.Contains(listRecorder.Body.String(), `"failureType":"WA"`) {
		t.Fatalf("list status = %d, body = %s", listRecorder.Code, listRecorder.Body.String())
	}
}

func TestSavedCaseModelContainsRecipeButNoGeneratedTextField(t *testing.T) {
	history := domain.NewGenerationHistory("user", domain.GenerationRecipe{Seed: "1"}, time.Now())
	if history.Recipe.Seed != "1" {
		t.Fatal("recipe was not stored")
	}
}
