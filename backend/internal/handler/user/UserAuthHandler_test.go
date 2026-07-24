package handler

import (
	repository "backend/internal/infrastructure/user"
	userusecase "backend/internal/usecase/userusecase"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func newTestAuthHandler() (*echo.Echo, *UserAuthHandler) {
	echoServer := echo.New()
	repo := repository.NewMemoryAuthRepository()
	return echoServer, NewUserAuthHandler(userusecase.NewUserUsecase(repo, repo), false)
}

func performJSON(
	t *testing.T,
	echoServer *echo.Echo,
	method string,
	path string,
	body string,
	handler echo.HandlerFunc,
) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()
	if err := handler(echoServer.NewContext(request, recorder)); err != nil {
		t.Fatal(err)
	}
	return recorder
}

func TestAuthCookieLifecycle(t *testing.T) {
	echoServer, handler := newTestAuthHandler()
	register := performJSON(
		t, echoServer, http.MethodPost, "/apis/users/create",
		`{"username":"tester","password":"password123"}`, handler.Register,
	)
	if register.Code != http.StatusCreated {
		t.Fatalf("register status = %d, body = %s", register.Code, register.Body.String())
	}
	if strings.Contains(register.Body.String(), "password123") {
		t.Fatal("registration response exposed the password")
	}

	login := performJSON(
		t, echoServer, http.MethodPost, "/apis/users/login",
		`{"username":"tester","password":"password123"}`, handler.Login,
	)
	if login.Code != http.StatusOK {
		t.Fatalf("login status = %d, body = %s", login.Code, login.Body.String())
	}
	cookies := login.Result().Cookies()
	if len(cookies) != 1 || cookies[0].Name != SessionCookieName {
		t.Fatalf("cookies = %#v", cookies)
	}
	if !cookies[0].HttpOnly || cookies[0].SameSite != http.SameSiteLaxMode {
		t.Fatalf("unsafe cookie settings: %#v", cookies[0])
	}

	meRequest := httptest.NewRequest(http.MethodGet, "/apis/users/me", nil)
	meRequest.AddCookie(cookies[0])
	meRecorder := httptest.NewRecorder()
	if err := handler.RequireAuth(handler.Me)(echoServer.NewContext(meRequest, meRecorder)); err != nil {
		t.Fatal(err)
	}
	if meRecorder.Code != http.StatusOK || !strings.Contains(meRecorder.Body.String(), `"username":"tester"`) {
		t.Fatalf("me status = %d, body = %s", meRecorder.Code, meRecorder.Body.String())
	}

	logoutRequest := httptest.NewRequest(http.MethodPost, "/apis/users/logout", nil)
	logoutRequest.AddCookie(cookies[0])
	logoutRecorder := httptest.NewRecorder()
	if err := handler.Logout(echoServer.NewContext(logoutRequest, logoutRecorder)); err != nil {
		t.Fatal(err)
	}
	if logoutRecorder.Code != http.StatusNoContent {
		t.Fatalf("logout status = %d", logoutRecorder.Code)
	}

	afterLogoutRequest := httptest.NewRequest(http.MethodGet, "/apis/users/me", nil)
	afterLogoutRequest.AddCookie(cookies[0])
	afterLogoutRecorder := httptest.NewRecorder()
	if err := handler.RequireAuth(handler.Me)(
		echoServer.NewContext(afterLogoutRequest, afterLogoutRecorder),
	); err != nil {
		t.Fatal(err)
	}
	if afterLogoutRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("after logout status = %d", afterLogoutRecorder.Code)
	}
}

func TestAuthRejectsDuplicateAndInvalidLogin(t *testing.T) {
	echoServer, handler := newTestAuthHandler()
	performJSON(
		t, echoServer, http.MethodPost, "/apis/users/create",
		`{"username":"tester","password":"password123"}`, handler.Register,
	)
	duplicate := performJSON(
		t, echoServer, http.MethodPost, "/apis/users/create",
		`{"username":"tester","password":"password456"}`, handler.Register,
	)
	if duplicate.Code != http.StatusConflict {
		t.Fatalf("duplicate status = %d", duplicate.Code)
	}
	login := performJSON(
		t, echoServer, http.MethodPost, "/apis/users/login",
		`{"username":"tester","password":"wrong-password"}`, handler.Login,
	)
	if login.Code != http.StatusUnauthorized ||
		!strings.Contains(login.Body.String(), "invalid username or password") {
		t.Fatalf("login status = %d, body = %s", login.Code, login.Body.String())
	}
}
