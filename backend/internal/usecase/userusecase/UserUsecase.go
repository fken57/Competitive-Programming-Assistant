package userusecase

import (
	"backend/internal/domain/user"
	"context"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserUsecase struct {
	userRepository user.UserRepository
}

func NewUserUsecase(userRepository user.UserRepository) *UserUsecase {
	return &UserUsecase{
		userRepository: userRepository,
	}
}

func (u *UserUsecase) RegisterUser(ctx context.Context, username string, rawPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user := user.NewUser(username, string(hashedPassword), time.Now())
	err = u.userRepository.Save(ctx, user)
	if err != nil {
		return err
	}
	return nil
}

func (u *UserUsecase) Login(ctx context.Context, username string, password string) (*user.User, error) {
	user, err := u.userRepository.FindByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("user not found")
	}
	if !user.CheckPassword(password) {
		return nil, errors.New("invalid password")
	}
	return user, nil
}

func (u *UserUsecase) GetUserByID(ctx context.Context, id string) (*user.User, error) {
	return u.userRepository.FindByID(ctx, id)
}

func (u *UserUsecase) GetUserByUsername(ctx context.Context, username string) (*user.User, error) {
	return u.userRepository.FindByUsername(ctx, username)
}
