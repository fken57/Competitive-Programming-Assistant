package handler

import(
	"backend/internal/usecase/userusecase"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
)

type UserAuthHandler struct {
	userUsecase userusecase.UserUsecase
}

func NewUserAuthHandler(userUsecase userusecase.UserUsecase) *UserAuthHandler {
	return &UserAuthHandler{
		userUsecase: userUsecase,
	}
}

type RegisterRequest struct {
	username    string `json:"username"`
	Password string `json:"password"`
}

func (h *UserAuthHandler) Register(c echo.Context) error {
	var req RegisterRequest
	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return err
	}
	var ctx = c.Request().Context()

	var result = h.userUsecase.RegisterUser(ctx, req.username, req.Password);

	if result != nil {
		return result
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "User registered successfully",
	})
}