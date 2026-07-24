package userusecase

import (
	"backend/internal/domain/user"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const SessionLifetime = 7 * 24 * time.Hour

type UserUsecase struct {
	userRepository    user.UserRepository
	sessionRepository user.SessionRepository
	now               func() time.Time
}

type LoginResult struct {
	User      *user.User
	Token     string
	ExpiresAt time.Time
}

func NewUserUsecase(
	userRepository user.UserRepository,
	sessionRepository user.SessionRepository,
) *UserUsecase {
	return &UserUsecase{
		userRepository: userRepository, sessionRepository: sessionRepository,
		now: time.Now,
	}
}

func (usecase *UserUsecase) RegisterUser(
	ctx context.Context,
	username string,
	rawPassword string,
) (*user.User, error) {
	username = strings.TrimSpace(username)
	if len(username) < 3 || len(username) > 50 {
		return nil, user.ErrInvalidUsername
	}
	if len(rawPassword) < 8 || len(rawPassword) > 72 {
		return nil, user.ErrInvalidPassword
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	entity := user.NewUser(username, string(hashedPassword), usecase.now().UTC())
	if err := usecase.userRepository.Save(ctx, entity); err != nil {
		return nil, err
	}
	return entity, nil
}

func (usecase *UserUsecase) Login(
	ctx context.Context,
	username string,
	password string,
) (LoginResult, error) {
	entity, err := usecase.userRepository.FindByUsername(ctx, strings.TrimSpace(username))
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			return LoginResult{}, user.ErrInvalidCredentials
		}
		return LoginResult{}, err
	}
	if entity == nil || !entity.CheckPassword(password) {
		return LoginResult{}, user.ErrInvalidCredentials
	}
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return LoginResult{}, err
	}
	token := base64.RawURLEncoding.EncodeToString(tokenBytes)
	now := usecase.now().UTC()
	expiresAt := now.Add(SessionLifetime)
	session := user.NewSession(entity.GetID(), HashSessionToken(token), now, expiresAt)
	if err := usecase.sessionRepository.SaveSession(ctx, session); err != nil {
		return LoginResult{}, err
	}
	return LoginResult{User: entity, Token: token, ExpiresAt: expiresAt}, nil
}

func (usecase *UserUsecase) Authenticate(ctx context.Context, token string) (*user.User, error) {
	if token == "" {
		return nil, user.ErrSessionNotFound
	}
	session, err := usecase.sessionRepository.FindSessionByTokenHash(ctx, HashSessionToken(token))
	if err != nil {
		return nil, err
	}
	if session.IsExpired(usecase.now()) {
		_ = usecase.sessionRepository.DeleteSessionByTokenHash(ctx, HashSessionToken(token))
		return nil, user.ErrSessionNotFound
	}
	return usecase.userRepository.FindByID(ctx, session.UserID())
}

func (usecase *UserUsecase) Logout(ctx context.Context, token string) error {
	if token == "" {
		return nil
	}
	return usecase.sessionRepository.DeleteSessionByTokenHash(ctx, HashSessionToken(token))
}

func (usecase *UserUsecase) GetUserByID(ctx context.Context, id string) (*user.User, error) {
	return usecase.userRepository.FindByID(ctx, id)
}

func (usecase *UserUsecase) GetUserByUsername(ctx context.Context, username string) (*user.User, error) {
	return usecase.userRepository.FindByUsername(ctx, username)
}

func HashSessionToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
