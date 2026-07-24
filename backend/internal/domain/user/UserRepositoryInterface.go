package user

import (
	"context"
	"time"
)

type UserRepository interface {
	Save(ctx context.Context, user *User) error
	FindByUsername(ctx context.Context, username string) (*User, error)
	FindByID(ctx context.Context, id string) (*User, error)
}

type SessionRepository interface {
	SaveSession(ctx context.Context, session *Session) error
	FindSessionByTokenHash(ctx context.Context, tokenHash string) (*Session, error)
	DeleteSessionByTokenHash(ctx context.Context, tokenHash string) error
	DeleteExpiredSessions(ctx context.Context, now time.Time) error
}
