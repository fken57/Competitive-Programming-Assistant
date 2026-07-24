package userusecase

import (
	domain "backend/internal/domain/user"
	repository "backend/internal/infrastructure/user"
	"context"
	"errors"
	"testing"
)

func TestRegisterLoginAuthenticateAndLogout(t *testing.T) {
	repo := repository.NewMemoryAuthRepository()
	usecase := NewUserUsecase(repo, repo)
	ctx := context.Background()

	registered, err := usecase.RegisterUser(ctx, "tester", "password123")
	if err != nil {
		t.Fatal(err)
	}
	login, err := usecase.Login(ctx, "tester", "password123")
	if err != nil {
		t.Fatal(err)
	}
	if login.Token == "" {
		t.Fatal("session token is empty")
	}
	authenticated, err := usecase.Authenticate(ctx, login.Token)
	if err != nil {
		t.Fatal(err)
	}
	if authenticated.GetID() != registered.GetID() {
		t.Fatalf("authenticated user = %s, want %s", authenticated.GetID(), registered.GetID())
	}
	if err := usecase.Logout(ctx, login.Token); err != nil {
		t.Fatal(err)
	}
	if _, err := usecase.Authenticate(ctx, login.Token); !errors.Is(err, domain.ErrSessionNotFound) {
		t.Fatalf("authenticate after logout error = %v", err)
	}
}

func TestRegistrationValidationAndDuplicateUsername(t *testing.T) {
	repo := repository.NewMemoryAuthRepository()
	usecase := NewUserUsecase(repo, repo)
	ctx := context.Background()

	if _, err := usecase.RegisterUser(ctx, "ab", "password123"); err == nil {
		t.Fatal("short username was accepted")
	}
	if _, err := usecase.RegisterUser(ctx, "tester", "short"); err == nil {
		t.Fatal("short password was accepted")
	}
	if _, err := usecase.RegisterUser(ctx, "tester", "password123"); err != nil {
		t.Fatal(err)
	}
	if _, err := usecase.RegisterUser(ctx, "tester", "password456"); !errors.Is(err, domain.ErrUsernameExists) {
		t.Fatalf("duplicate error = %v", err)
	}
}

func TestLoginDoesNotRevealWhetherUsernameOrPasswordWasWrong(t *testing.T) {
	repo := repository.NewMemoryAuthRepository()
	usecase := NewUserUsecase(repo, repo)
	ctx := context.Background()
	if _, err := usecase.RegisterUser(ctx, "tester", "password123"); err != nil {
		t.Fatal(err)
	}

	_, missingUserError := usecase.Login(ctx, "missing", "password123")
	_, wrongPasswordError := usecase.Login(ctx, "tester", "wrong-password")
	if !errors.Is(missingUserError, domain.ErrInvalidCredentials) ||
		!errors.Is(wrongPasswordError, domain.ErrInvalidCredentials) {
		t.Fatalf("errors = %v, %v", missingUserError, wrongPasswordError)
	}
}
