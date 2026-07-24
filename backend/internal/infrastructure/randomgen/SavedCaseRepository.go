package randomgen

import (
	domain "backend/internal/domain/randomgen"
	"context"
	"encoding/json"
	"sort"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
)

type MemorySavedCaseRepository struct {
	mutex   sync.RWMutex
	history []domain.GenerationHistory
	killed  []domain.KilledCase
	presets []domain.GeneratorPreset
}

var _ domain.SavedCaseRepository = (*MemorySavedCaseRepository)(nil)

func NewMemorySavedCaseRepository() *MemorySavedCaseRepository {
	return &MemorySavedCaseRepository{}
}

func (repository *MemorySavedCaseRepository) SaveHistory(
	_ context.Context,
	history domain.GenerationHistory,
) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	repository.history = append(repository.history, history)
	return nil
}

func (repository *MemorySavedCaseRepository) ListHistory(
	_ context.Context,
	userID string,
	now time.Time,
) ([]domain.GenerationHistory, error) {
	repository.mutex.RLock()
	defer repository.mutex.RUnlock()
	result := make([]domain.GenerationHistory, 0)
	for _, item := range repository.history {
		if item.UserID == userID && item.ExpiresAt.After(now) {
			result = append(result, item)
		}
	}
	sort.Slice(result, func(i, j int) bool { return result[i].CreatedAt.After(result[j].CreatedAt) })
	if len(result) > 50 {
		result = result[:50]
	}
	return result, nil
}

func (repository *MemorySavedCaseRepository) DeleteExpiredHistory(
	_ context.Context,
	now time.Time,
) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	active := repository.history[:0]
	for _, item := range repository.history {
		if item.ExpiresAt.After(now) {
			active = append(active, item)
		}
	}
	repository.history = active
	return nil
}

func (repository *MemorySavedCaseRepository) SaveKilledCase(
	_ context.Context,
	killedCase domain.KilledCase,
) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	repository.killed = append(repository.killed, killedCase)
	return nil
}

func (repository *MemorySavedCaseRepository) ListKilledCases(
	_ context.Context,
	userID string,
	reasonTag string,
) ([]domain.KilledCase, error) {
	repository.mutex.RLock()
	defer repository.mutex.RUnlock()
	result := make([]domain.KilledCase, 0)
	for _, item := range repository.killed {
		if item.UserID != userID || (reasonTag != "" && !contains(item.ReasonTags, reasonTag)) {
			continue
		}
		result = append(result, item)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].CreatedAt.After(result[j].CreatedAt) })
	return result, nil
}

func (repository *MemorySavedCaseRepository) SavePreset(
	_ context.Context,
	preset domain.GeneratorPreset,
) error {
	repository.mutex.Lock()
	defer repository.mutex.Unlock()
	repository.presets = append(repository.presets, preset)
	return nil
}

func (repository *MemorySavedCaseRepository) ListPresets(
	_ context.Context,
	userID string,
) ([]domain.GeneratorPreset, error) {
	repository.mutex.RLock()
	defer repository.mutex.RUnlock()
	result := make([]domain.GeneratorPreset, 0)
	for _, item := range repository.presets {
		if item.UserID == userID {
			result = append(result, item)
		}
	}
	sort.Slice(result, func(i, j int) bool { return result[i].CreatedAt.After(result[j].CreatedAt) })
	return result, nil
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

type PostgresSavedCaseRepository struct {
	db *sqlx.DB
}

var _ domain.SavedCaseRepository = (*PostgresSavedCaseRepository)(nil)

func NewPostgresSavedCaseRepository(db *sqlx.DB) *PostgresSavedCaseRepository {
	return &PostgresSavedCaseRepository{db: db}
}

func (repository *PostgresSavedCaseRepository) SaveHistory(
	ctx context.Context,
	history domain.GenerationHistory,
) error {
	recipe, err := json.Marshal(history.Recipe)
	if err != nil {
		return err
	}
	_, err = repository.db.ExecContext(ctx, `INSERT INTO generation_histories
		(id, user_id, created_at, expires_at, recipe_json, killed_flag)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		history.ID, history.UserID, history.CreatedAt, history.ExpiresAt, recipe, history.KilledFlag,
	)
	return err
}

func (repository *PostgresSavedCaseRepository) ListHistory(
	ctx context.Context,
	userID string,
	now time.Time,
) ([]domain.GenerationHistory, error) {
	rows := []historyRow{}
	err := repository.db.SelectContext(ctx, &rows, `SELECT id, user_id, created_at, expires_at,
		recipe_json, killed_flag FROM generation_histories
		WHERE user_id = $1 AND expires_at > $2 ORDER BY created_at DESC LIMIT 50`, userID, now)
	if err != nil {
		return nil, err
	}
	result := make([]domain.GenerationHistory, len(rows))
	for index, row := range rows {
		recipe, err := decodeRecipe(row.RecipeJSON)
		if err != nil {
			return nil, err
		}
		result[index] = domain.GenerationHistory{
			ID: row.ID, UserID: row.UserID, CreatedAt: row.CreatedAt,
			ExpiresAt: row.ExpiresAt, Recipe: recipe, KilledFlag: row.KilledFlag,
		}
	}
	return result, nil
}

func (repository *PostgresSavedCaseRepository) DeleteExpiredHistory(
	ctx context.Context,
	now time.Time,
) error {
	_, err := repository.db.ExecContext(ctx, "DELETE FROM generation_histories WHERE expires_at <= $1", now)
	return err
}

func (repository *PostgresSavedCaseRepository) SaveKilledCase(
	ctx context.Context,
	killedCase domain.KilledCase,
) error {
	recipe, err := json.Marshal(killedCase.Recipe)
	if err != nil {
		return err
	}
	tags, err := json.Marshal(killedCase.ReasonTags)
	if err != nil {
		return err
	}
	_, err = repository.db.ExecContext(ctx, `INSERT INTO killed_cases
		(id, user_id, title, created_at, updated_at, recipe_json, failure_type,
		reason_tags_json, notes, is_favorite)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
		killedCase.ID, killedCase.UserID, killedCase.Title, killedCase.CreatedAt,
		killedCase.UpdatedAt, recipe, killedCase.FailureType, tags,
		killedCase.Notes, killedCase.IsFavorite,
	)
	return err
}

func (repository *PostgresSavedCaseRepository) ListKilledCases(
	ctx context.Context,
	userID string,
	reasonTag string,
) ([]domain.KilledCase, error) {
	rows := []killedCaseRow{}
	query := `SELECT id, user_id, title, created_at, updated_at, recipe_json,
		failure_type, reason_tags_json, notes, is_favorite FROM killed_cases
		WHERE user_id = $1`
	args := []interface{}{userID}
	if reasonTag != "" {
		tagJSON, _ := json.Marshal([]string{reasonTag})
		query += " AND reason_tags_json @> $2::jsonb"
		args = append(args, string(tagJSON))
	}
	query += " ORDER BY created_at DESC"
	if err := repository.db.SelectContext(ctx, &rows, query, args...); err != nil {
		return nil, err
	}
	result := make([]domain.KilledCase, len(rows))
	for index, row := range rows {
		recipe, err := decodeRecipe(row.RecipeJSON)
		if err != nil {
			return nil, err
		}
		var tags []string
		if err := json.Unmarshal(row.ReasonTagsJSON, &tags); err != nil {
			return nil, err
		}
		result[index] = domain.KilledCase{
			ID: row.ID, UserID: row.UserID, Title: row.Title,
			CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt, Recipe: recipe,
			FailureType: row.FailureType, ReasonTags: tags, Notes: row.Notes,
			IsFavorite: row.IsFavorite,
		}
	}
	return result, nil
}

func (repository *PostgresSavedCaseRepository) SavePreset(
	ctx context.Context,
	preset domain.GeneratorPreset,
) error {
	recipe, err := json.Marshal(preset.Recipe)
	if err != nil {
		return err
	}
	_, err = repository.db.ExecContext(ctx, `INSERT INTO generator_presets
		(id, user_id, name, created_at, updated_at, recipe_json)
		VALUES ($1,$2,$3,$4,$5,$6)`,
		preset.ID, preset.UserID, preset.Name, preset.CreatedAt, preset.UpdatedAt, recipe,
	)
	return err
}

func (repository *PostgresSavedCaseRepository) ListPresets(
	ctx context.Context,
	userID string,
) ([]domain.GeneratorPreset, error) {
	rows := []presetRow{}
	err := repository.db.SelectContext(ctx, &rows, `SELECT id, user_id, name,
		created_at, updated_at, recipe_json FROM generator_presets
		WHERE user_id = $1 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	result := make([]domain.GeneratorPreset, len(rows))
	for index, row := range rows {
		recipe, err := decodeRecipe(row.RecipeJSON)
		if err != nil {
			return nil, err
		}
		result[index] = domain.GeneratorPreset{
			ID: row.ID, UserID: row.UserID, Name: row.Name,
			CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt, Recipe: recipe,
		}
	}
	return result, nil
}

type historyRow struct {
	ID         string          `db:"id"`
	UserID     string          `db:"user_id"`
	CreatedAt  time.Time       `db:"created_at"`
	ExpiresAt  time.Time       `db:"expires_at"`
	RecipeJSON json.RawMessage `db:"recipe_json"`
	KilledFlag bool            `db:"killed_flag"`
}

type killedCaseRow struct {
	ID             string          `db:"id"`
	UserID         string          `db:"user_id"`
	Title          string          `db:"title"`
	CreatedAt      time.Time       `db:"created_at"`
	UpdatedAt      time.Time       `db:"updated_at"`
	RecipeJSON     json.RawMessage `db:"recipe_json"`
	FailureType    string          `db:"failure_type"`
	ReasonTagsJSON json.RawMessage `db:"reason_tags_json"`
	Notes          string          `db:"notes"`
	IsFavorite     bool            `db:"is_favorite"`
}

type presetRow struct {
	ID         string          `db:"id"`
	UserID     string          `db:"user_id"`
	Name       string          `db:"name"`
	CreatedAt  time.Time       `db:"created_at"`
	UpdatedAt  time.Time       `db:"updated_at"`
	RecipeJSON json.RawMessage `db:"recipe_json"`
}

func decodeRecipe(value json.RawMessage) (domain.GenerationRecipe, error) {
	var recipe domain.GenerationRecipe
	err := json.Unmarshal(value, &recipe)
	return recipe, err
}
