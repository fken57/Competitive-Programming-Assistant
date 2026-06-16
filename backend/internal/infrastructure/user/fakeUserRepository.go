package repository

import (
	"context"

	"github.com/jmoiron/sqlx"
	"backend/internal/domain/user"
)


type FakeUserRepository struct{
	db *sqlx.DB
}

var _ user.UserRepository = (*FakeUserRepository)(nil)

func NewFakeUserRepository(db *sqlx.DB) user.UserRepository {
	return &FakeUserRepository{db: db}
}

func (r *FakeUserRepository) Save(ctx context.Context, u *user.User) error {
	return nil
}

func (r *FakeUserRepository) FindByUsername(ctx context.Context, username string) (*user.User, error) {
	return nil, nil
}

func (r *FakeUserRepository) FindByID(ctx context.Context, id string) (*user.User, error) {
	return nil, nil
}