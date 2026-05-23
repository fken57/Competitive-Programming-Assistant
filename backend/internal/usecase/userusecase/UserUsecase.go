package userusecase

import (
	"backend/internal/domain/user"
	"context"
	"golang.org/x/crypto/bcrypt"
	"time"
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

func (u *UserUsecase) GetUserByID(ctx context.Context, id string) (*user.User, error) {
	return u.userRepository.FindByID(ctx, id)
}

func (u *UserUsecase) GetUserByUsername(ctx context.Context, username string) (*user.User, error) {
	return u.userRepository.FindByUsername(ctx, username)
}