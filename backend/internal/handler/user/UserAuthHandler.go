package handler

import (
	userusecase "backend/internal/usecase/userusecase"
	"encoding/json"
	"log"
	"net/http"
	"errors"

	"github.com/labstack/echo/v4"
)

type UserAuthHandler struct {
	userUsecase *userusecase.UserUsecase
}

func NewUserAuthHandler(userUsecase *userusecase.UserUsecase) *UserAuthHandler {
	return &UserAuthHandler{
		userUsecase: userUsecase,
	}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginReturnRequest struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Time     string `json:"time"`
}

func (h *UserAuthHandler) Register(c echo.Context) error {
	var req RegisterRequest

	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return err
	}

	log.Printf("[BIND_DEBUG] フロントから届いたユーザー名: '%s', パスワード: '%s'", req.Username, req.Password)
	var ctx = c.Request().Context()

	var result = h.userUsecase.RegisterUser(ctx, req.Username, req.Password)

	if result != nil {
		if errors.Is(result, errors.New("username already exists")) {
			return c.JSON(http.StatusConflict, map[string]interface{}{
				"error": "Username already exists",
			})
		}
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": result.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "User registered successfully",
	})
}

func (h *UserAuthHandler) Login(c echo.Context) error {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return err
	}
	var ctx = c.Request().Context()

	user, err := h.userUsecase.Login(ctx, req.Username, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": err.Error(),
		})
	}

	var loginUser = LoginReturnRequest{
		Id:       user.GetID(),
		Username: user.GetName(),
		Time:     user.GetCreatedAt().Format("2006-01-02 15:04:05"),
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Login successful",
		"user":    loginUser,
	})
}
