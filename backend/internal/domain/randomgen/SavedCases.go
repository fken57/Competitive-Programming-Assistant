package randomgen

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

var ErrSavedCaseRepositoryUnavailable = errors.New("saved case repository is unavailable")

var validFailureTypes = map[string]bool{
	"WA": true, "RE": true, "TLE": true, "MLE": true,
	"CE": true, "UNKNOWN": true,
}

type GenerationHistory struct {
	ID         string           `json:"id"`
	UserID     string           `json:"-"`
	CreatedAt  time.Time        `json:"createdAt"`
	ExpiresAt  time.Time        `json:"expiresAt"`
	Recipe     GenerationRecipe `json:"recipe"`
	KilledFlag bool             `json:"killedFlag"`
}

type KilledCase struct {
	ID          string           `json:"id"`
	UserID      string           `json:"-"`
	Title       string           `json:"title"`
	CreatedAt   time.Time        `json:"createdAt"`
	UpdatedAt   time.Time        `json:"updatedAt"`
	Recipe      GenerationRecipe `json:"recipe"`
	FailureType string           `json:"failureType"`
	ReasonTags  []string         `json:"reasonTags"`
	Notes       string           `json:"notes"`
	IsFavorite  bool             `json:"isFavorite"`
}

type GeneratorPreset struct {
	ID        string           `json:"id"`
	UserID    string           `json:"-"`
	Name      string           `json:"name"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
	Recipe    GenerationRecipe `json:"recipe"`
}

type SavedCaseRepository interface {
	SaveHistory(ctx context.Context, history GenerationHistory) error
	ListHistory(ctx context.Context, userID string, now time.Time) ([]GenerationHistory, error)
	DeleteExpiredHistory(ctx context.Context, now time.Time) error
	SaveKilledCase(ctx context.Context, killedCase KilledCase) error
	ListKilledCases(ctx context.Context, userID, reasonTag string) ([]KilledCase, error)
	SavePreset(ctx context.Context, preset GeneratorPreset) error
	ListPresets(ctx context.Context, userID string) ([]GeneratorPreset, error)
}

func NewGenerationHistory(userID string, recipe GenerationRecipe, now time.Time) GenerationHistory {
	return GenerationHistory{
		ID: uuid.NewString(), UserID: userID, CreatedAt: now,
		ExpiresAt: now.Add(24 * time.Hour), Recipe: recipe, KilledFlag: false,
	}
}

func NewKilledCase(
	userID string,
	title string,
	recipe GenerationRecipe,
	failureType string,
	reasonTags []string,
	notes string,
	now time.Time,
) (KilledCase, error) {
	title = strings.TrimSpace(title)
	if title == "" || len(title) > 120 {
		return KilledCase{}, errors.New("title must be between 1 and 120 characters")
	}
	if !validFailureTypes[failureType] {
		return KilledCase{}, errors.New("invalid failureType")
	}
	if len(reasonTags) > 20 {
		return KilledCase{}, errors.New("reasonTags must contain at most 20 tags")
	}
	cleanedTags := make([]string, 0, len(reasonTags))
	seen := make(map[string]struct{})
	for _, tag := range reasonTags {
		tag = strings.TrimSpace(tag)
		if tag == "" || len(tag) > 50 {
			return KilledCase{}, errors.New("each reason tag must be between 1 and 50 characters")
		}
		if _, exists := seen[tag]; !exists {
			seen[tag] = struct{}{}
			cleanedTags = append(cleanedTags, tag)
		}
	}
	if len(notes) > 5_000 {
		return KilledCase{}, errors.New("notes must contain at most 5000 characters")
	}
	return KilledCase{
		ID: uuid.NewString(), UserID: userID, Title: title,
		CreatedAt: now, UpdatedAt: now, Recipe: recipe,
		FailureType: failureType, ReasonTags: cleanedTags, Notes: notes,
	}, nil
}

func NewGeneratorPreset(
	userID string,
	name string,
	recipe GenerationRecipe,
	now time.Time,
) (GeneratorPreset, error) {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 80 {
		return GeneratorPreset{}, errors.New("preset name must be between 1 and 80 characters")
	}
	return GeneratorPreset{
		ID: uuid.NewString(), UserID: userID, Name: name,
		CreatedAt: now, UpdatedAt: now, Recipe: recipe,
	}, nil
}
