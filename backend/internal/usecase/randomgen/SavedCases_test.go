package randomgen

import (
	domain "backend/internal/domain/randomgen"
	repository "backend/internal/infrastructure/randomgen"
	"context"
	"testing"
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
	history, err := usecase.ListHistory(ctx, "user-1")
	if err != nil || len(history) != 1 || history[0].Recipe.Seed != "123" {
		t.Fatalf("history = %#v, error = %v", history, err)
	}

	if _, err := usecase.SaveKilledCase(
		ctx, "user-1", "off by one", recipe, "WA",
		[]string{"boundary", "off-by-one"}, "fails at N=2",
	); err != nil {
		t.Fatal(err)
	}
	killed, err := usecase.ListKilledCases(ctx, "user-1", "boundary")
	if err != nil || len(killed) != 1 || killed[0].FailureType != "WA" {
		t.Fatalf("killed = %#v, error = %v", killed, err)
	}
	filtered, err := usecase.ListKilledCases(ctx, "user-1", "TLE")
	if err != nil || len(filtered) != 0 {
		t.Fatalf("filtered = %#v, error = %v", filtered, err)
	}

	if _, err := usecase.SavePreset(ctx, "user-1", "small array", recipe); err != nil {
		t.Fatal(err)
	}
	presets, err := usecase.ListPresets(ctx, "user-1")
	if err != nil || len(presets) != 1 || presets[0].Name != "small array" {
		t.Fatalf("presets = %#v, error = %v", presets, err)
	}
}
