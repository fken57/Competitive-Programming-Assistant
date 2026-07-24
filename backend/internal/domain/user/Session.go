package user

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	id        string
	userID    string
	tokenHash string
	createdAt time.Time
	expiresAt time.Time
}

type SessionSnapshot struct {
	ID        string    `db:"id"`
	UserID    string    `db:"user_id"`
	TokenHash string    `db:"token_hash"`
	CreatedAt time.Time `db:"created_at"`
	ExpiresAt time.Time `db:"expires_at"`
}

func NewSession(userID, tokenHash string, createdAt, expiresAt time.Time) *Session {
	return &Session{
		id: uuid.NewString(), userID: userID, tokenHash: tokenHash,
		createdAt: createdAt, expiresAt: expiresAt,
	}
}

func SessionFromSnapshot(snapshot SessionSnapshot) *Session {
	return &Session{
		id: snapshot.ID, userID: snapshot.UserID, tokenHash: snapshot.TokenHash,
		createdAt: snapshot.CreatedAt, expiresAt: snapshot.ExpiresAt,
	}
}

func (session *Session) ToSnapshot() SessionSnapshot {
	return SessionSnapshot{
		ID: session.id, UserID: session.userID, TokenHash: session.tokenHash,
		CreatedAt: session.createdAt, ExpiresAt: session.expiresAt,
	}
}

func (session *Session) UserID() string {
	return session.userID
}

func (session *Session) IsExpired(now time.Time) bool {
	return !session.expiresAt.After(now)
}

func (session *Session) ExpiresAt() time.Time {
	return session.expiresAt
}
