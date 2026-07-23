package randomgen

import domain "backend/internal/domain/randomgen"

type RandomGenUsecase struct{}

func NewRandomGenUsecase() *RandomGenUsecase {
	return &RandomGenUsecase{}
}

func (usecase *RandomGenUsecase) Generate(recipe domain.GenerationRecipe) (domain.GeneratedCase, error) {
	return domain.Generate(recipe)
}
