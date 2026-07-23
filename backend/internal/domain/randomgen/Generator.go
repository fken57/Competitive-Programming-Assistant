package randomgen

import (
	"fmt"
)

func Generate(recipe GenerationRecipe) (GeneratedCase, error) {
	if err := recipe.ValidateCommon(); err != nil {
		return GeneratedCase{}, err
	}
	rng, err := NewSplitMix64(recipe.Seed)
	if err != nil {
		return GeneratedCase{}, err
	}

	var inputText string
	switch recipe.StructureType {
	case "array":
		inputText, err = GenerateArray(recipe, rng)
	case "tree":
		inputText, err = GenerateTree(recipe, rng)
	case "graph":
		inputText, err = GenerateGraph(recipe, rng)
	default:
		err = fmt.Errorf("unsupported structureType: %s", recipe.StructureType)
	}
	if err != nil {
		return GeneratedCase{}, err
	}
	if len(inputText) > MaxOutputBytes {
		return GeneratedCase{}, fmt.Errorf("generated input exceeds 10 MiB")
	}
	return GeneratedCase{Recipe: recipe, InputText: inputText}, nil
}
