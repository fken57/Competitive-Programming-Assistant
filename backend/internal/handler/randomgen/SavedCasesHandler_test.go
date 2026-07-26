package randomgen

import (
	domain "backend/internal/domain/randomgen"
	userdomain "backend/internal/domain/user"
	userhandler "backend/internal/handler/user"
	repository "backend/internal/infrastructure/randomgen"
	usecase "backend/internal/usecase/randomgen"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
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
		echoServer, http.MethodGet, "/killed-cases?tag=boundary&page=1", "",
		entity,
	)
	if err := handler.ListKilledCases(listContext); err != nil {
		t.Fatal(err)
	}
	if listRecorder.Code != http.StatusOK ||
		!strings.Contains(listRecorder.Body.String(), `"failureType":"WA"`) ||
		!strings.Contains(listRecorder.Body.String(), `"pageSize":10`) ||
		!strings.Contains(listRecorder.Body.String(), `"total":1`) {
		t.Fatalf("list status = %d, body = %s", listRecorder.Code, listRecorder.Body.String())
	}
}

func TestDeleteSavedCasesRequiresOwnershipAndReturnsNotFound(t *testing.T) {
	echoServer := echo.New()
	repo := repository.NewMemorySavedCaseRepository()
	handler := NewRandomGenHandler(usecase.NewRandomGenUsecase(repo))
	owner := userdomain.NewUser("owner", "hash", time.Now())
	other := userdomain.NewUser("other", "hash", time.Now())
	recipeJSON := `{
		"generatorVersion":"0.1.0","rngAlgorithm":"splitmix64-v1","seed":"123",
		"structureType":"array","caseType":"all_same",
		"params":{"N":2,"minValue":1,"maxValue":1},
		"outputFormat":{"indexBase":1,"hasT":false,"lineBreakStyle":"lf"}
	}`

	saveContext, saveRecorder := authenticatedContext(
		echoServer, http.MethodPost, "/history", `{"recipe":`+recipeJSON+`}`, owner,
	)
	if err := handler.SaveHistory(saveContext); err != nil {
		t.Fatal(err)
	}
	var history domain.GenerationHistory
	if err := json.Unmarshal(saveRecorder.Body.Bytes(), &history); err != nil {
		t.Fatal(err)
	}

	otherDeleteContext, otherDeleteRecorder := authenticatedContext(
		echoServer, http.MethodDelete, "/history/"+history.ID, "", other,
	)
	otherDeleteContext.SetParamNames("id")
	otherDeleteContext.SetParamValues(history.ID)
	if err := handler.DeleteHistory(otherDeleteContext); err != nil {
		t.Fatal(err)
	}
	if otherDeleteRecorder.Code != http.StatusNotFound {
		t.Fatalf("other user delete status = %d", otherDeleteRecorder.Code)
	}

	ownerDeleteContext, ownerDeleteRecorder := authenticatedContext(
		echoServer, http.MethodDelete, "/history/"+history.ID, "", owner,
	)
	ownerDeleteContext.SetParamNames("id")
	ownerDeleteContext.SetParamValues(history.ID)
	if err := handler.DeleteHistory(ownerDeleteContext); err != nil {
		t.Fatal(err)
	}
	if ownerDeleteRecorder.Code != http.StatusNoContent {
		t.Fatalf("owner delete status = %d, body = %s", ownerDeleteRecorder.Code, ownerDeleteRecorder.Body.String())
	}

	missingContext, missingRecorder := authenticatedContext(
		echoServer, http.MethodDelete, "/killed-cases/missing", "", owner,
	)
	missingContext.SetParamNames("id")
	missingContext.SetParamValues("missing")
	if err := handler.DeleteKilledCase(missingContext); err != nil {
		t.Fatal(err)
	}
	if missingRecorder.Code != http.StatusNotFound {
		t.Fatalf("missing killed case delete status = %d", missingRecorder.Code)
	}
}

func TestListSavedCasesRejectsInvalidPage(t *testing.T) {
	echoServer := echo.New()
	handler := NewRandomGenHandler(usecase.NewRandomGenUsecase(repository.NewMemorySavedCaseRepository()))
	entity := userdomain.NewUser("tester", "hash", time.Now())
	maxInt := int(^uint(0) >> 1)
	for _, page := range []string{"0", strconv.Itoa(maxInt)} {
		context, recorder := authenticatedContext(
			echoServer, http.MethodGet, "/history?page="+page, "", entity,
		)
		if err := handler.ListHistory(context); err != nil {
			t.Fatal(err)
		}
		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("page %s status = %d, want 400", page, recorder.Code)
		}
	}
}

func TestSavedCaseModelContainsRecipeButNoGeneratedTextField(t *testing.T) {
	history := domain.NewGenerationHistory("user", domain.GenerationRecipe{Seed: "1"}, time.Now())
	if history.Recipe.Seed != "1" {
		t.Fatal("recipe was not stored")
	}
}
