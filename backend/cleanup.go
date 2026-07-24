package main

import (
	randomgendomain "backend/internal/domain/randomgen"
	userdomain "backend/internal/domain/user"
	"context"
	"log"
	"time"
)

const cleanupInterval = time.Hour

func startCleanupLoop(
	ctx context.Context,
	sessionRepository userdomain.SessionRepository,
	savedCaseRepository randomgendomain.SavedCaseRepository,
) {
	cleanup := func() {
		now := time.Now().UTC()
		if err := sessionRepository.DeleteExpiredSessions(ctx, now); err != nil {
			log.Printf("delete expired sessions: %v", err)
		}
		if err := savedCaseRepository.DeleteExpiredHistory(ctx, now); err != nil {
			log.Printf("delete expired generation histories: %v", err)
		}
	}

	cleanup()
	ticker := time.NewTicker(cleanupInterval)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				cleanup()
			case <-ctx.Done():
				return
			}
		}
	}()
}
