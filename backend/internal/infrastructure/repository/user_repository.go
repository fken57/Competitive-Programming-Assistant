package repository

import (
	"backend/internal/domain/user"

	"github.com/jmoiron/sqlx"

	"context"
)

type userRepository struct {
	db *sqlx.DB
}

var _ user.UserRepository = (*userRepository)(nil)

func NewUserRepository(db *sqlx.DB) user.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Save(ctx context.Context, u *user.User) error {
	const query = "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
	snap := u.ToSnapshot()
	_, err := r.db.ExecContext(ctx, query, snap.ID, snap.Username, snap.PasswordHash, snap.CreatedAt)
	return err
}

func (r *userRepository) FindByUsername(ctx context.Context, username string) (*user.User, error) {
	const query = "SELECT id, username, password_hash, created_at FROM users WHERE username = ?"
	var snap user.UserPlainSnapshot
	err := r.db.GetContext(ctx, &snap, query, username)
	if err != nil {
		return nil, err
	}
	return user.FromSnapshot(snap), nil
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*user.User, error) {
	const query = "SELECT id, username, password_hash, created_at FROM users WHERE id = ?"
	var snap user.UserPlainSnapshot
	err := r.db.GetContext(ctx, &snap, query, id)
	if err != nil {
		return nil, err
	}
	return user.FromSnapshot(snap), nil
}
