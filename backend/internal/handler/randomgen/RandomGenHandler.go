package randomgen

import (
	domain "backend/internal/domain/randomgen"
	userdomain "backend/internal/domain/user"
	userhandler "backend/internal/handler/user"
	usecase "backend/internal/usecase/randomgen"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

type RandomGenHandler struct {
	usecase *usecase.RandomGenUsecase
}

type GenerateRequest struct {
	Recipe domain.GenerationRecipe `json:"recipe"`
}

type SaveKilledCaseRequest struct {
	Title       string                  `json:"title"`
	Recipe      domain.GenerationRecipe `json:"recipe"`
	FailureType string                  `json:"failureType"`
	ReasonTags  []string                `json:"reasonTags"`
	Notes       string                  `json:"notes"`
}

type SavePresetRequest struct {
	Name   string                  `json:"name"`
	Recipe domain.GenerationRecipe `json:"recipe"`
}

func NewRandomGenHandler(randomGenUsecase *usecase.RandomGenUsecase) *RandomGenHandler {
	return &RandomGenHandler{usecase: randomGenUsecase}
}

func (handler *RandomGenHandler) Generate(context echo.Context) error {
	decoder := json.NewDecoder(context.Request().Body)
	decoder.UseNumber()

	var request GenerateRequest
	if err := decoder.Decode(&request); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}
	result, err := handler.usecase.Generate(request.Recipe)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}
	return context.JSON(http.StatusOK, result)
}

func (handler *RandomGenHandler) SaveHistory(context echo.Context) error {
	var request GenerateRequest
	if err := context.Bind(&request); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	history, err := handler.usecase.SaveHistory(
		context.Request().Context(), authenticatedUserID(context), request.Recipe,
	)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusCreated, history)
}

func (handler *RandomGenHandler) ListHistory(context echo.Context) error {
	page, err := requestedPage(context)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	historyPage, err := handler.usecase.ListHistory(
		context.Request().Context(), authenticatedUserID(context), page,
	)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusOK, historyPage)
}

func (handler *RandomGenHandler) DeleteHistory(context echo.Context) error {
	return handler.deleteSavedCase(
		context,
		func(userID, savedCaseID string) error {
			return handler.usecase.DeleteHistory(
				context.Request().Context(), userID, savedCaseID,
			)
		},
	)
}

func (handler *RandomGenHandler) SaveKilledCase(context echo.Context) error {
	var request SaveKilledCaseRequest
	if err := context.Bind(&request); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	killedCase, err := handler.usecase.SaveKilledCase(
		context.Request().Context(), authenticatedUserID(context), request.Title,
		request.Recipe, request.FailureType, request.ReasonTags, request.Notes,
	)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusCreated, killedCase)
}

func (handler *RandomGenHandler) ListKilledCases(context echo.Context) error {
	page, err := requestedPage(context)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	killedCasePage, err := handler.usecase.ListKilledCases(
		context.Request().Context(), authenticatedUserID(context),
		strings.TrimSpace(context.QueryParam("tag")), page,
	)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusOK, killedCasePage)
}

func (handler *RandomGenHandler) DeleteKilledCase(context echo.Context) error {
	return handler.deleteSavedCase(
		context,
		func(userID, savedCaseID string) error {
			return handler.usecase.DeleteKilledCase(
				context.Request().Context(), userID, savedCaseID,
			)
		},
	)
}

func (handler *RandomGenHandler) SavePreset(context echo.Context) error {
	var request SavePresetRequest
	if err := context.Bind(&request); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	preset, err := handler.usecase.SavePreset(
		context.Request().Context(), authenticatedUserID(context), request.Name, request.Recipe,
	)
	if err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusCreated, preset)
}

func (handler *RandomGenHandler) ListPresets(context echo.Context) error {
	presets, err := handler.usecase.ListPresets(
		context.Request().Context(), authenticatedUserID(context),
	)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusOK, map[string]interface{}{"presets": presets})
}

func authenticatedUserID(context echo.Context) string {
	entity, _ := context.Get(userhandler.AuthenticatedUserKey).(*userdomain.User)
	if entity == nil {
		return ""
	}
	return entity.GetID()
}

func requestedPage(context echo.Context) (int, error) {
	value := context.QueryParam("page")
	if value == "" {
		return 1, nil
	}
	page, err := strconv.Atoi(value)
	maxInt := int(^uint(0) >> 1)
	if err != nil || page < 1 || page-1 > maxInt/domain.SavedCasesPageSize {
		return 0, domain.ErrInvalidPage
	}
	return page, nil
}

func (handler *RandomGenHandler) deleteSavedCase(
	context echo.Context,
	deleteCase func(userID, savedCaseID string) error,
) error {
	savedCaseID := strings.TrimSpace(context.Param("id"))
	if savedCaseID == "" {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "saved case id is required"})
	}
	err := deleteCase(authenticatedUserID(context), savedCaseID)
	if errors.Is(err, domain.ErrSavedCaseNotFound) {
		return context.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	if err != nil {
		return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return context.NoContent(http.StatusNoContent)
}
