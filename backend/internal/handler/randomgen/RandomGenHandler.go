package randomgen

import (
	domain "backend/internal/domain/randomgen"
	usecase "backend/internal/usecase/randomgen"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
)

type RandomGenHandler struct {
	usecase *usecase.RandomGenUsecase
}

type GenerateRequest struct {
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
