package randomgen

import (
	domain "backend/internal/domain/randomgen"
	repository "backend/internal/infrastructure/randomgen"
	"context"
	"errors"
	"strconv"
	"testing"
	"time"
)

func savedRecipe() domain.GenerationRecipe {
	return domain.GenerationRecipe{
		GeneratorVersion: domain.GeneratorVersion,
		RNGAlgorithm:     domain.RNGAlgorithm,
		Seed:             "123",
		StructureType:    "array",
		CaseType:         "all_same",
		Params:           map[string]interface{}{"N": 2, "minValue": 1, "maxValue": 1},
		OutputFormat:     domain.OutputFormat{IndexBase: 1, LineBreakStyle: "lf"},
	}
}

func TestSavedCaseLifecycleStoresRecipes(t *testing.T) {
	repo := repository.NewMemorySavedCaseRepository()
	usecase := NewRandomGenUsecase(repo)
	ctx := context.Background()
	recipe := savedRecipe()

	if _, err := usecase.SaveHistory(ctx, "user-1", recipe); err != nil {
		t.Fatal(err)
	}
	historyPage, err := usecase.ListHistory(ctx, "user-1", 1)
	if err != nil || len(historyPage.History) != 1 || historyPage.History[0].Recipe.Seed != "123" {
		t.Fatalf("history = %#v, error = %v", historyPage, err)
	}

	if _, err := usecase.SaveKilledCase(
		ctx, "user-1", "off by one", recipe, "WA",
		[]string{"boundary", "off-by-one"}, "fails at N=2",
	); err != nil {
		t.Fatal(err)
	}
	killedPage, err := usecase.ListKilledCases(ctx, "user-1", "boundary", 1)
	if err != nil || len(killedPage.KilledCases) != 1 || killedPage.KilledCases[0].FailureType != "WA" {
		t.Fatalf("killed = %#v, error = %v", killedPage, err)
	}
	filteredPage, err := usecase.ListKilledCases(ctx, "user-1", "TLE", 1)
	if err != nil || len(filteredPage.KilledCases) != 0 {
		t.Fatalf("filtered = %#v, error = %v", filteredPage, err)
	}

	if _, err := usecase.SavePreset(ctx, "user-1", "small array", recipe); err != nil {
		t.Fatal(err)
	}
	presets, err := usecase.ListPresets(ctx, "user-1")
	if err != nil || len(presets) != 1 || presets[0].Name != "small array" {
		t.Fatalf("presets = %#v, error = %v", presets, err)
	}
}

func TestSavedCasePaginationAndOwnedDeletion(t *testing.T) {
	repo := repository.NewMemorySavedCaseRepository()
	usecase := NewRandomGenUsecase(repo)
	ctx := context.Background()
	baseTime := time.Date(2026, 7, 27, 0, 0, 0, 0, time.UTC)
	var oldestHistoryID string

	for index := 0; index < 11; index++ {
		usecase.now = func() time.Time { return baseTime.Add(time.Duration(index) * time.Second) }
		recipe := savedRecipe()
		recipe.Seed = strconv.Itoa(index)
		history, err := usecase.SaveHistory(ctx, "user-1", recipe)
		if err != nil {
			t.Fatal(err)
		}
		if index == 0 {
			oldestHistoryID = history.ID
		}
	}

	firstPage, err := usecase.ListHistory(ctx, "user-1", 1)
	if err != nil {
		t.Fatal(err)
	}
	if len(firstPage.History) != domain.SavedCasesPageSize || firstPage.Pagination.Total != 11 {
		t.Fatalf("first page = %#v", firstPage)
	}
	secondPage, err := usecase.ListHistory(ctx, "user-1", 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(secondPage.History) != 1 || secondPage.History[0].ID != oldestHistoryID {
		t.Fatalf("second page = %#v", secondPage)
	}

	if err := usecase.DeleteHistory(ctx, "user-2", oldestHistoryID); !errors.Is(err, domain.ErrSavedCaseNotFound) {
		t.Fatalf("other user's history delete error = %v", err)
	}
	if err := usecase.DeleteHistory(ctx, "user-1", oldestHistoryID); err != nil {
		t.Fatal(err)
	}
	afterDelete, err := usecase.ListHistory(ctx, "user-1", 1)
	if err != nil || afterDelete.Pagination.Total != 10 {
		t.Fatalf("history after delete = %#v, error = %v", afterDelete, err)
	}

	var boundaryCaseID string
	for index := 0; index < 13; index++ {
		usecase.now = func() time.Time { return baseTime.Add(time.Duration(index) * time.Second) }
		tag := "other"
		if index < 11 {
			tag = "boundary"
		}
		killedCase, err := usecase.SaveKilledCase(
			ctx, "user-1", "case "+strconv.Itoa(index), savedRecipe(), "WA", []string{tag}, "",
		)
		if err != nil {
			t.Fatal(err)
		}
		if index == 0 {
			boundaryCaseID = killedCase.ID
		}
	}
	boundaryPage, err := usecase.ListKilledCases(ctx, "user-1", "boundary", 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(boundaryPage.KilledCases) != 1 || boundaryPage.Pagination.Total != 11 {
		t.Fatalf("filtered killed cases = %#v", boundaryPage)
	}
	if err := usecase.DeleteKilledCase(ctx, "user-2", boundaryCaseID); !errors.Is(err, domain.ErrSavedCaseNotFound) {
		t.Fatalf("other user's killed case delete error = %v", err)
	}
	if err := usecase.DeleteKilledCase(ctx, "user-1", boundaryCaseID); err != nil {
		t.Fatal(err)
	}
	boundaryAfterDelete, err := usecase.ListKilledCases(ctx, "user-1", "boundary", 1)
	if err != nil || boundaryAfterDelete.Pagination.Total != 10 {
		t.Fatalf("killed cases after delete = %#v, error = %v", boundaryAfterDelete, err)
	}
}

func TestSavedCasePaginationRejectsInvalidPage(t *testing.T) {
	usecase := NewRandomGenUsecase(repository.NewMemorySavedCaseRepository())
	maxInt := int(^uint(0) >> 1)
	for _, page := range []int{0, maxInt} {
		if _, err := usecase.ListHistory(context.Background(), "user-1", page); !errors.Is(err, domain.ErrInvalidPage) {
			t.Fatalf("page %d error = %v", page, err)
		}
	}
}
