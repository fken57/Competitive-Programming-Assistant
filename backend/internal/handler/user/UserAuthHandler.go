package handler

import (
	domain "backend/internal/domain/user"
	userusecase "backend/internal/usecase/userusecase"
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

const (
	SessionCookieName    = "cpa_session"
	AuthenticatedUserKey = "authenticated_user"
)

type UserAuthHandler struct {
	userUsecase  *userusecase.UserUsecase
	secureCookie bool
}

type CredentialsRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserResponse struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	CreatedAt string `json:"createdAt"`
}

func NewUserAuthHandler(
	usecase *userusecase.UserUsecase,
	secureCookie bool,
) *UserAuthHandler {
	return &UserAuthHandler{userUsecase: usecase, secureCookie: secureCookie}
}

func (handler *UserAuthHandler) Register(context echo.Context) error {
	var request CredentialsRequest
	if err := context.Bind(&request); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	entity, err := handler.userUsecase.RegisterUser(
		context.Request().Context(), request.Username, request.Password,
	)
	if err != nil {
		status := http.StatusInternalServerError
		switch {
		case errors.Is(err, domain.ErrUsernameExists):
			status = http.StatusConflict
		case errors.Is(err, domain.ErrInvalidUsername), errors.Is(err, domain.ErrInvalidPassword):
			status = http.StatusBadRequest
		}
		return context.JSON(status, map[string]string{"error": err.Error()})
	}
	return context.JSON(http.StatusCreated, toUserResponse(entity))
}

func (handler *UserAuthHandler) Login(context echo.Context) error {
	var request CredentialsRequest
	if err := context.Bind(&request); err != nil {
		return context.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	result, err := handler.userUsecase.Login(
		context.Request().Context(), request.Username, request.Password,
	)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, domain.ErrInvalidCredentials) {
			status = http.StatusUnauthorized
		}
		return context.JSON(status, map[string]string{"error": err.Error()})
	}
	handler.setSessionCookie(context, result.Token, result.ExpiresAt)
	return context.JSON(http.StatusOK, toUserResponse(result.User))
}

func (handler *UserAuthHandler) Logout(context echo.Context) error {
	cookie, _ := context.Cookie(SessionCookieName)
	if cookie != nil {
		if err := handler.userUsecase.Logout(context.Request().Context(), cookie.Value); err != nil {
			return context.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	handler.clearSessionCookie(context)
	return context.NoContent(http.StatusNoContent)
}

func (handler *UserAuthHandler) Me(context echo.Context) error {
	entity, ok := context.Get(AuthenticatedUserKey).(*domain.User)
	if !ok || entity == nil {
		return context.JSON(http.StatusUnauthorized, map[string]string{"error": "authentication required"})
	}
	return context.JSON(http.StatusOK, toUserResponse(entity))
}

func (handler *UserAuthHandler) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(context echo.Context) error {
		cookie, err := context.Cookie(SessionCookieName)
		if err != nil {
			return context.JSON(http.StatusUnauthorized, map[string]string{"error": "authentication required"})
		}
		entity, err := handler.userUsecase.Authenticate(context.Request().Context(), cookie.Value)
		if err != nil {
			handler.clearSessionCookie(context)
			return context.JSON(http.StatusUnauthorized, map[string]string{"error": "authentication required"})
		}
		context.Set(AuthenticatedUserKey, entity)
		return next(context)
	}
}

func (handler *UserAuthHandler) setSessionCookie(
	context echo.Context,
	token string,
	expiresAt time.Time,
) {
	context.SetCookie(&http.Cookie{
		Name: SessionCookieName, Value: token, Path: "/",
		Expires: expiresAt, MaxAge: int(time.Until(expiresAt).Seconds()),
		HttpOnly: true, Secure: handler.secureCookie, SameSite: http.SameSiteLaxMode,
	})
}

func (handler *UserAuthHandler) clearSessionCookie(context echo.Context) {
	context.SetCookie(&http.Cookie{
		Name: SessionCookieName, Value: "", Path: "/",
		Expires: time.Unix(0, 0), MaxAge: -1,
		HttpOnly: true, Secure: handler.secureCookie, SameSite: http.SameSiteLaxMode,
	})
}

func toUserResponse(entity *domain.User) UserResponse {
	return UserResponse{
		ID: entity.GetID(), Username: entity.GetName(),
		CreatedAt: entity.GetCreatedAt().UTC().Format(time.RFC3339),
	}
}
