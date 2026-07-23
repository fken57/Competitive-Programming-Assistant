package randomgen

import (
	"fmt"
	"strconv"
	"strings"
)

type generatedEdge struct {
	from   int
	to     int
	weight int
}

var treeCaseTypes = map[string]bool{
	"random": true, "path": true, "star": true,
	"binary_like": true, "broom": true,
}

func GenerateTree(recipe GenerationRecipe, rng *SplitMix64) (string, error) {
	if !treeCaseTypes[recipe.CaseType] {
		return "", fmt.Errorf("unsupported tree caseType: %s", recipe.CaseType)
	}
	n, err := IntParam(recipe.Params, "N")
	if err != nil {
		return "", err
	}
	weighted, err := BoolParam(recipe.Params, "weighted")
	if err != nil {
		return "", err
	}
	shuffleLabels, err := BoolParam(recipe.Params, "shuffleLabels")
	if err != nil {
		return "", err
	}
	if n < 1 || n > MaxN {
		return "", fmt.Errorf("N must be between 1 and %d", MaxN)
	}
	minWeight, maxWeight := 1, 1
	if weighted {
		minWeight, err = IntParam(recipe.Params, "minWeight")
		if err != nil {
			return "", err
		}
		maxWeight, err = IntParam(recipe.Params, "maxWeight")
		if err != nil {
			return "", err
		}
		if minWeight < MinAllowedValue || maxWeight > MaxAllowedValue || minWeight > maxWeight {
			return "", fmt.Errorf("weights must satisfy %d <= minWeight <= maxWeight <= %d", MinAllowedValue, MaxAllowedValue)
		}
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
		edges := generateTreeEdges(n, recipe.CaseType, rng)
		if shuffleLabels {
			labels := make([]int, n)
			for index := range labels {
				labels[index] = index
			}
			rng.Shuffle(n, func(i, j int) { labels[i], labels[j] = labels[j], labels[i] })
			for index := range edges {
				edges[index].from = labels[edges[index].from]
				edges[index].to = labels[edges[index].to]
			}
		}
		fmt.Fprintln(&builder, n)
		for _, edge := range edges {
			builder.WriteString(strconv.Itoa(edge.from + recipe.OutputFormat.IndexBase))
			builder.WriteByte(' ')
			builder.WriteString(strconv.Itoa(edge.to + recipe.OutputFormat.IndexBase))
			if weighted {
				builder.WriteByte(' ')
				builder.WriteString(strconv.Itoa(rng.IntRange(minWeight, maxWeight)))
			}
			builder.WriteByte('\n')
		}
		if builder.Len() > MaxOutputBytes {
			return "", fmt.Errorf("generated input exceeds 10 MiB")
		}
	}
	return builder.String(), nil
}

func generateTreeEdges(n int, caseType string, rng *SplitMix64) []generatedEdge {
	edges := make([]generatedEdge, 0, max(0, n-1))
	for vertex := 1; vertex < n; vertex++ {
		parent := 0
		switch caseType {
		case "path":
			parent = vertex - 1
		case "star":
			parent = 0
		case "binary_like":
			parent = (vertex - 1) / 2
		case "broom":
			handleLength := max(1, n/2)
			if vertex < handleLength {
				parent = vertex - 1
			} else {
				parent = handleLength - 1
			}
		default:
			parent = rng.Intn(vertex)
		}
		edges = append(edges, generatedEdge{from: parent, to: vertex})
	}
	return edges
}
