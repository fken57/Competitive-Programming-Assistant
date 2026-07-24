package randomgen

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
)

const (
	GeneratorVersion = "0.1.0"
	RNGAlgorithm     = "splitmix64-v1"
	MaxOutputBytes   = 10 * 1024 * 1024
	MaxN             = 200_000
	MaxGraphEdges    = 500_000
	MaxTestCases     = 100
	MinAllowedValue  = -1_000_000_000
	MaxAllowedValue  = 1_000_000_000
)

type OutputFormat struct {
	IndexBase      int    `json:"indexBase"`
	HasT           bool   `json:"hasT"`
	LineBreakStyle string `json:"lineBreakStyle,omitempty"`
}

type GenerationRecipe struct {
	GeneratorVersion string                 `json:"generatorVersion"`
	RNGAlgorithm     string                 `json:"rngAlgorithm"`
	Seed             string                 `json:"seed"`
	StructureType    string                 `json:"structureType"`
	CaseType         string                 `json:"caseType"`
	Params           map[string]interface{} `json:"params"`
	OutputFormat     OutputFormat           `json:"outputFormat"`
}

type GeneratedCase struct {
	Recipe    GenerationRecipe `json:"recipe"`
	InputText string           `json:"inputText"`
}

func (recipe GenerationRecipe) ValidateCommon() error {
	if recipe.GeneratorVersion != GeneratorVersion {
		return fmt.Errorf("unsupported generatorVersion: %s", recipe.GeneratorVersion)
	}
	if recipe.RNGAlgorithm != RNGAlgorithm {
		return fmt.Errorf("unsupported rngAlgorithm: %s", recipe.RNGAlgorithm)
	}
	if _, err := strconv.ParseUint(recipe.Seed, 10, 64); err != nil {
		return errors.New("seed must be an unsigned 64-bit integer")
	}
	if recipe.OutputFormat.IndexBase != 0 && recipe.OutputFormat.IndexBase != 1 {
		return errors.New("indexBase must be 0 or 1")
	}
	if recipe.OutputFormat.LineBreakStyle != "" && recipe.OutputFormat.LineBreakStyle != "lf" {
		return errors.New("lineBreakStyle must be lf")
	}
	if recipe.Params == nil {
		return errors.New("params is required")
	}
	return nil
}

func IntParam(params map[string]interface{}, name string) (int, error) {
	value, ok := params[name]
	if !ok {
		return 0, fmt.Errorf("%s is required", name)
	}
	var parsed int64
	switch typed := value.(type) {
	case int:
		parsed = int64(typed)
	case int64:
		parsed = typed
	case float64:
		if typed != float64(int64(typed)) {
			return 0, fmt.Errorf("%s must be an integer", name)
		}
		parsed = int64(typed)
	case json.Number:
		number, err := typed.Int64()
		if err != nil {
			return 0, fmt.Errorf("%s must be an integer", name)
		}
		parsed = number
	default:
		return 0, fmt.Errorf("%s must be an integer", name)
	}
	if int64(int(parsed)) != parsed {
		return 0, fmt.Errorf("%s is out of range", name)
	}
	return int(parsed), nil
}

func BoolParam(params map[string]interface{}, name string) (bool, error) {
	value, ok := params[name]
	if !ok {
		return false, fmt.Errorf("%s is required", name)
	}
	parsed, ok := value.(bool)
	if !ok {
		return false, fmt.Errorf("%s must be a boolean", name)
	}
	return parsed, nil
}

func StringParam(params map[string]interface{}, name string) (string, error) {
	value, ok := params[name]
	if !ok {
		return "", fmt.Errorf("%s is required", name)
	}
	parsed, ok := value.(string)
	if !ok || parsed == "" {
		return "", fmt.Errorf("%s must be a non-empty string", name)
	}
	return parsed, nil
}

func TestCount(recipe GenerationRecipe) (int, error) {
	if !recipe.OutputFormat.HasT {
		return 1, nil
	}
	count, err := IntParam(recipe.Params, "testCount")
	if err != nil {
		return 0, err
	}
	if count < 1 || count > MaxTestCases {
		return 0, fmt.Errorf("testCount must be between 1 and %d", MaxTestCases)
	}
	return count, nil
}
