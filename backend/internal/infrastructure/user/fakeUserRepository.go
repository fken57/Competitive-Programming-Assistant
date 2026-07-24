package repository

import (
	"backend/internal/domain/user"
	"context"
	"sync"
	"time"
)

type MemoryAuthRepository struct {
	mutex          sync.RWMutex
	usersByID      map[string]user.UserPlainSnapshot
	userIDByName   map[string]string
	sessionsByHash map[string]user.SessionSnapshot
}

var _ user.UserRepository = (*MemoryAuthRepository)(nil)
var _ user.SessionRepository = (*MemoryAuthRepository)(nil)

func NewMemoryAuthRepository() *MemoryAuthRepository {
	return &MemoryAuthRepository{
		usersByID:      make(map[string]user.UserPlainSnapshot),
		userIDByName:   make(map[string]string),
		sessionsByHash: make(map[string]user.SessionSnapshot),
	}
}

func (repository *MemoryAuthRepository) Save(_ context.Context, entity *user.User) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	snapshot := entity.ToSnapshot()
	if _, exists := repository.userIDByName[snapshot.Username]; exists {
		return user.ErrUsernameExists
	}
	repository.usersByID[snapshot.ID] = snapshot
	repository.userIDByName[snapshot.Username] = snapshot.ID
	return nil
}

func (repository *MemoryAuthRepository) FindByUsername(_ context.Context, username string) (*user.User, error) {
	repository.mutex.RLock()
	defer repository.mutex.RUnlock()
	id, exists := repository.userIDByName[username]
	if !exists {
		return nil, user.ErrUserNotFound
	}
	return user.FromSnapshot(repository.usersByID[id]), nil
}

func (repository *MemoryAuthRepository) FindByID(_ context.Context, id string) (*user.User, error) {
	repository.mutex.RLock()
	defer repository.mutex.RUnlock()
	snapshot, exists := repository.usersByID[id]
	if !exists {
		return nil, user.ErrUserNotFound
	}
	return user.FromSnapshot(snapshot), nil
}

func (repository *MemoryAuthRepository) SaveSession(_ context.Context, session *user.Session) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	snapshot := session.ToSnapshot()
	repository.sessionsByHash[snapshot.TokenHash] = snapshot
	return nil
}

func (repository *MemoryAuthRepository) FindSessionByTokenHash(_ context.Context, tokenHash string) (*user.Session, error) {
	repository.mutex.RLock()
	defer repository.mutex.RUnlock()
	snapshot, exists := repository.sessionsByHash[tokenHash]
	if !exists {
		return nil, user.ErrSessionNotFound
	}
	return user.SessionFromSnapshot(snapshot), nil
}

func (repository *MemoryAuthRepository) DeleteSessionByTokenHash(_ context.Context, tokenHash string) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	delete(repository.sessionsByHash, tokenHash)
	return nil
}

func (repository *MemoryAuthRepository) DeleteExpiredSessions(_ context.Context, now time.Time) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	for tokenHash, snapshot := range repository.sessionsByHash {
		if !snapshot.ExpiresAt.After(now) {
			delete(repository.sessionsByHash, tokenHash)
		}
	}
	return nil
}
