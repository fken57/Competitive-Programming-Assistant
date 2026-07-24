package repository

import (
	"backend/internal/domain/user"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jmoiron/sqlx"

	"context"
	"database/sql"
	"errors"
	"time"
)

type userRepository struct {
	db *sqlx.DB
}

var _ user.UserRepository = (*userRepository)(nil)

func NewUserRepository(db *sqlx.DB) user.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Save(ctx context.Context, u *user.User) error {
	const query = `INSERT INTO users (id, username, password_hash, created_at) VALUES ($1, $2, $3, $4)`
	snap := u.ToSnapshot()
	_, err := r.db.ExecContext(ctx, query, snap.ID, snap.Username, snap.PasswordHash, snap.CreatedAt)
	if err != nil {
		if pgError, ok := err.(*pgconn.PgError); ok {
			if pgError.Code == "23505" {
				return user.ErrUsernameExists
			}
		}
		return err
	}
	return nil
}

func (r *userRepository) FindByUsername(ctx context.Context, username string) (*user.User, error) {
	const query = "SELECT id, username, password_hash, created_at FROM users WHERE username = $1"
	var snap user.UserPlainSnapshot
	err := r.db.GetContext(ctx, &snap, query, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return user.FromSnapshot(snap), nil
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*user.User, error) {
	const query = "SELECT id, username, password_hash, created_at FROM users WHERE id = $1"
	var snap user.UserPlainSnapshot
	err := r.db.GetContext(ctx, &snap, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, user.ErrUserNotFound
		}
		return nil, err
	}
	return user.FromSnapshot(snap), nil
}

type sessionRepository struct {
	db *sqlx.DB
}

var _ user.SessionRepository = (*sessionRepository)(nil)

func NewSessionRepository(db *sqlx.DB) user.SessionRepository {
	return &sessionRepository{db: db}
}

func (repository *sessionRepository) SaveSession(ctx context.Context, session *user.Session) error {
	const query = `INSERT INTO user_sessions
		(id, user_id, token_hash, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)`
	snapshot := session.ToSnapshot()
	_, err := repository.db.ExecContext(
		ctx, query, snapshot.ID, snapshot.UserID, snapshot.TokenHash,
		snapshot.CreatedAt, snapshot.ExpiresAt,
	)
	return err
}

func (repository *sessionRepository) FindSessionByTokenHash(ctx context.Context, tokenHash string) (*user.Session, error) {
	const query = `SELECT id, user_id, token_hash, created_at, expires_at
		FROM user_sessions WHERE token_hash = $1`
	var snapshot user.SessionSnapshot
	if err := repository.db.GetContext(ctx, &snapshot, query, tokenHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, user.ErrSessionNotFound
		}
		return nil, err
	}
	return user.SessionFromSnapshot(snapshot), nil
}

func (repository *sessionRepository) DeleteSessionByTokenHash(ctx context.Context, tokenHash string) error {
	_, err := repository.db.ExecContext(ctx, "DELETE FROM user_sessions WHERE token_hash = $1", tokenHash)
	return err
}

func (repository *sessionRepository) DeleteExpiredSessions(ctx context.Context, now time.Time) error {
	_, err := repository.db.ExecContext(ctx, "DELETE FROM user_sessions WHERE expires_at <= $1", now)
	return err
}
