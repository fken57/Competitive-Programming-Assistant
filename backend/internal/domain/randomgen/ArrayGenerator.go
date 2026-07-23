package randomgen

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

var arrayCaseTypes = map[string]bool{
	"uniform": true, "all_same": true, "many_duplicates": true,
	"sorted_asc": true, "sorted_desc": true, "almost_sorted": true,
	"zero_heavy": true, "min_max_heavy": true, "alternating": true,
}

func GenerateArray(recipe GenerationRecipe, rng *SplitMix64) (string, error) {
	if !arrayCaseTypes[recipe.CaseType] {
		return "", fmt.Errorf("unsupported array caseType: %s", recipe.CaseType)
	}
	n, err := IntParam(recipe.Params, "N")
	if err != nil {
		return "", err
	}
	minValue, err := IntParam(recipe.Params, "minValue")
	if err != nil {
		return "", err
	}
	maxValue, err := IntParam(recipe.Params, "maxValue")
	if err != nil {
		return "", err
	}
	if n < 1 || n > MaxN {
		return "", fmt.Errorf("N must be between 1 and %d", MaxN)
	}
	if minValue < MinAllowedValue || maxValue > MaxAllowedValue || minValue > maxValue {
		return "", fmt.Errorf("values must satisfy %d <= minValue <= maxValue <= %d", MinAllowedValue, MaxAllowedValue)
	}
	if recipe.CaseType == "zero_heavy" && (minValue > 0 || maxValue < 0) {
		return "", fmt.Errorf("zero_heavy requires a value range containing 0")
	}
	testCount, err := TestCount(recipe)
	if err != nil {
		return "", err
	}

	var builder strings.Builder
	if recipe.OutputFormat.HasT {
		fmt.Fprintln(&builder, testCount)
	}
	for testIndex := 0; testIndex < testCount; testIndex++ {
		values := generateArrayValues(n, minValue, maxValue, recipe.CaseType, rng)
		fmt.Fprintln(&builder, n)
		for index, value := range values {
			if index > 0 {
				builder.WriteByte(' ')
			}
			builder.WriteString(strconv.Itoa(value))
		}
		builder.WriteByte('\n')
		if builder.Len() > MaxOutputBytes {
			return "", fmt.Errorf("generated input exceeds 10 MiB")
		}
	}
	return builder.String(), nil
}

func generateArrayValues(n, minValue, maxValue int, caseType string, rng *SplitMix64) []int {
	values := make([]int, n)
	fillUniform := func() {
		for index := range values {
			values[index] = rng.IntRange(minValue, maxValue)
		}
	}

	switch caseType {
	case "all_same":
		value := rng.IntRange(minValue, maxValue)
		for index := range values {
			values[index] = value
		}
	case "many_duplicates":
		poolSize := min(8, maxValue-minValue+1)
		pool := make([]int, poolSize)
		for index := range pool {
			pool[index] = rng.IntRange(minValue, maxValue)
		}
		for index := range values {
			values[index] = pool[rng.Intn(poolSize)]
		}
	case "zero_heavy":
		for index := range values {
			if rng.Intn(10) < 7 {
				values[index] = 0
			} else {
				values[index] = rng.IntRange(minValue, maxValue)
			}
		}
	case "min_max_heavy":
		for index := range values {
			switch rng.Intn(10) {
			case 0:
				values[index] = rng.IntRange(minValue, maxValue)
			case 1, 2, 3, 4:
				values[index] = minValue
			default:
				values[index] = maxValue
			}
		}
	case "alternating":
		first := rng.IntRange(minValue, maxValue)
		second := rng.IntRange(minValue, maxValue)
		for index := range values {
			if index%2 == 0 {
				values[index] = first
			} else {
				values[index] = second
			}
		}
	default:
		fillUniform()
		if caseType == "sorted_asc" || caseType == "sorted_desc" || caseType == "almost_sorted" {
			sort.Ints(values)
		}
		if caseType == "sorted_desc" {
			for left, right := 0, len(values)-1; left < right; left, right = left+1, right-1 {
				values[left], values[right] = values[right], values[left]
			}
		}
		if caseType == "almost_sorted" && n > 1 {
			swapCount := max(1, n/20)
			for count := 0; count < swapCount; count++ {
				index := rng.Intn(n - 1)
				values[index], values[index+1] = values[index+1], values[index]
			}
		}
	}
	return values
}
