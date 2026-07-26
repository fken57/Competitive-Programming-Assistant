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
	page int,
) (domain.GenerationHistoryPage, error) {
	if usecase.savedCases == nil {
		return domain.GenerationHistoryPage{}, domain.ErrSavedCaseRepositoryUnavailable
	}
	if !isValidPage(page) {
		return domain.GenerationHistoryPage{}, domain.ErrInvalidPage
	}
	now := usecase.now().UTC()
	if err := usecase.savedCases.DeleteExpiredHistory(ctx, now); err != nil {
		return domain.GenerationHistoryPage{}, err
	}
	history, total, err := usecase.savedCases.ListHistory(
		ctx, userID, now, page, domain.SavedCasesPageSize,
	)
	if err != nil {
		return domain.GenerationHistoryPage{}, err
	}
	return domain.GenerationHistoryPage{
		History: history,
		Pagination: domain.Pagination{
			Page: page, PageSize: domain.SavedCasesPageSize, Total: total,
		},
	}, nil
}

func (usecase *RandomGenUsecase) DeleteHistory(
	ctx context.Context,
	userID string,
	historyID string,
) error {
	if usecase.savedCases == nil {
		return domain.ErrSavedCaseRepositoryUnavailable
	}
	return usecase.savedCases.DeleteHistory(ctx, userID, historyID)
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
	page int,
) (domain.KilledCasePage, error) {
	if usecase.savedCases == nil {
		return domain.KilledCasePage{}, domain.ErrSavedCaseRepositoryUnavailable
	}
	if !isValidPage(page) {
		return domain.KilledCasePage{}, domain.ErrInvalidPage
	}
	killedCases, total, err := usecase.savedCases.ListKilledCases(
		ctx, userID, reasonTag, page, domain.SavedCasesPageSize,
	)
	if err != nil {
		return domain.KilledCasePage{}, err
	}
	return domain.KilledCasePage{
		KilledCases: killedCases,
		Pagination: domain.Pagination{
			Page: page, PageSize: domain.SavedCasesPageSize, Total: total,
		},
	}, nil
}

func (usecase *RandomGenUsecase) DeleteKilledCase(
	ctx context.Context,
	userID string,
	killedCaseID string,
) error {
	if usecase.savedCases == nil {
		return domain.ErrSavedCaseRepositoryUnavailable
	}
	return usecase.savedCases.DeleteKilledCase(ctx, userID, killedCaseID)
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

func isValidPage(page int) bool {
	if page < 1 {
		return false
	}
	maxInt := int(^uint(0) >> 1)
	return page-1 <= maxInt/domain.SavedCasesPageSize
}
