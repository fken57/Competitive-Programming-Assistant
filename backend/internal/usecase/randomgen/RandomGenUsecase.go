package randomgen

import (
	domain "backend/internal/domain/randomgen"
	"context"
	"time"
)

type RandomGenUsecase struct {
	savedCases domain.SavedCaseRepository
	now        func() time.Time
}

func NewRandomGenUsecase(repositories ...domain.SavedCaseRepository) *RandomGenUsecase {
	usecase := &RandomGenUsecase{now: time.Now}
	if len(repositories) > 0 {
		usecase.savedCases = repositories[0]
	}
	return usecase
}

func (usecase *RandomGenUsecase) Generate(recipe domain.GenerationRecipe) (domain.GeneratedCase, error) {
	return domain.Generate(recipe)
}

func (usecase *RandomGenUsecase) SaveHistory(
	ctx context.Context,
	userID string,
	recipe domain.GenerationRecipe,
) (domain.GenerationHistory, error) {
	if err := usecase.validateSavedRecipe(recipe); err != nil {
		return domain.GenerationHistory{}, err
	}
	now := usecase.now().UTC()
	history := domain.NewGenerationHistory(userID, recipe, now)
	if err := usecase.savedCases.DeleteExpiredHistory(ctx, now); err != nil {
		return domain.GenerationHistory{}, err
	}
	if err := usecase.savedCases.SaveHistory(ctx, history); err != nil {
		return domain.GenerationHistory{}, err
	}
	return history, nil
}

func (usecase *RandomGenUsecase) ListHistory(
	ctx context.Context,
	userID string,
) ([]domain.GenerationHistory, error) {
	if usecase.savedCases == nil {
		return nil, domain.ErrSavedCaseRepositoryUnavailable
	}
	now := usecase.now().UTC()
	if err := usecase.savedCases.DeleteExpiredHistory(ctx, now); err != nil {
		return nil, err
	}
	return usecase.savedCases.ListHistory(ctx, userID, now)
}

func (usecase *RandomGenUsecase) SaveKilledCase(
	ctx context.Context,
	userID string,
	title string,
	recipe domain.GenerationRecipe,
	failureType string,
	reasonTags []string,
	notes string,
) (domain.KilledCase, error) {
	if err := usecase.validateSavedRecipe(recipe); err != nil {
		return domain.KilledCase{}, err
	}
	killedCase, err := domain.NewKilledCase(
		userID, title, recipe, failureType, reasonTags, notes, usecase.now().UTC(),
	)
	if err != nil {
		return domain.KilledCase{}, err
	}
	if err := usecase.savedCases.SaveKilledCase(ctx, killedCase); err != nil {
		return domain.KilledCase{}, err
	}
	return killedCase, nil
}

func (usecase *RandomGenUsecase) ListKilledCases(
	ctx context.Context,
	userID string,
	reasonTag string,
) ([]domain.KilledCase, error) {
	if usecase.savedCases == nil {
		return nil, domain.ErrSavedCaseRepositoryUnavailable
	}
	return usecase.savedCases.ListKilledCases(ctx, userID, reasonTag)
}

func (usecase *RandomGenUsecase) SavePreset(
	ctx context.Context,
	userID string,
	name string,
	recipe domain.GenerationRecipe,
) (domain.GeneratorPreset, error) {
	if err := usecase.validateSavedRecipe(recipe); err != nil {
		return domain.GeneratorPreset{}, err
	}
	preset, err := domain.NewGeneratorPreset(userID, name, recipe, usecase.now().UTC())
	if err != nil {
		return domain.GeneratorPreset{}, err
	}
	if err := usecase.savedCases.SavePreset(ctx, preset); err != nil {
		return domain.GeneratorPreset{}, err
	}
	return preset, nil
}

func (usecase *RandomGenUsecase) ListPresets(
	ctx context.Context,
	userID string,
) ([]domain.GeneratorPreset, error) {
	if usecase.savedCases == nil {
		return nil, domain.ErrSavedCaseRepositoryUnavailable
	}
	return usecase.savedCases.ListPresets(ctx, userID)
}

func (usecase *RandomGenUsecase) validateSavedRecipe(recipe domain.GenerationRecipe) error {
	if usecase.savedCases == nil {
		return domain.ErrSavedCaseRepositoryUnavailable
	}
	_, err := domain.Generate(recipe)
	return err
}
