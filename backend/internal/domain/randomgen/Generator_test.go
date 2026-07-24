package randomgen

import (
	"strconv"
	"strings"
	"testing"
)

func baseRecipe(structureType, caseType string, params map[string]interface{}) GenerationRecipe {
	return GenerationRecipe{
		GeneratorVersion: GeneratorVersion,
		RNGAlgorithm:     RNGAlgorithm,
		Seed:             "123456789",
		StructureType:    structureType,
		CaseType:         caseType,
		Params:           params,
		OutputFormat: OutputFormat{
			IndexBase:      1,
			LineBreakStyle: "lf",
		},
	}
}

func TestSplitMix64KnownSequence(t *testing.T) {
	rng, err := NewSplitMix64("0")
	if err != nil {
		t.Fatal(err)
	}
	if got, want := rng.Next(), uint64(16294208416658607535); got != want {
		t.Fatalf("first value = %d, want %d", got, want)
	}
}

func TestGenerateIsDeterministic(t *testing.T) {
	recipe := baseRecipe("array", "uniform", map[string]interface{}{
		"N": 5, "minValue": -10, "maxValue": 10,
	})
	first, err := Generate(recipe)
	if err != nil {
		t.Fatal(err)
	}
	second, err := Generate(recipe)
	if err != nil {
		t.Fatal(err)
	}
	if first.InputText != second.InputText {
		t.Fatalf("same recipe generated different output:\n%s\n%s", first.InputText, second.InputText)
	}
}

func TestArrayCaseTypes(t *testing.T) {
	caseTypes := []string{
		"uniform", "all_same", "many_duplicates", "sorted_asc", "sorted_desc",
		"almost_sorted", "zero_heavy", "min_max_heavy", "alternating",
	}
	for _, caseType := range caseTypes {
		t.Run(caseType, func(t *testing.T) {
			recipe := baseRecipe("array", caseType, map[string]interface{}{
				"N": 20, "minValue": -5, "maxValue": 5,
			})
			result, err := Generate(recipe)
			if err != nil {
				t.Fatal(err)
			}
			lines := strings.Split(strings.TrimSpace(result.InputText), "\n")
			if len(lines) != 2 || lines[0] != "20" || len(strings.Fields(lines[1])) != 20 {
				t.Fatalf("unexpected array output: %q", result.InputText)
			}
		})
	}
}

func TestHasTGeneratesRequestedCases(t *testing.T) {
	recipe := baseRecipe("array", "all_same", map[string]interface{}{
		"N": 1, "minValue": 0, "maxValue": 9, "testCount": 3,
	})
	recipe.OutputFormat.HasT = true
	result, err := Generate(recipe)
	if err != nil {
		t.Fatal(err)
	}
	lines := strings.Split(strings.TrimSpace(result.InputText), "\n")
	if len(lines) != 7 || lines[0] != "3" {
		t.Fatalf("unexpected T output: %q", result.InputText)
	}
}

func TestTreeShapesAlwaysProduceNMinusOneValidEdges(t *testing.T) {
	for _, shape := range []string{"random", "path", "star", "binary_like", "broom"} {
		t.Run(shape, func(t *testing.T) {
			recipe := baseRecipe("tree", shape, map[string]interface{}{
				"N": 30, "weighted": true, "minWeight": -3, "maxWeight": 7,
				"shuffleLabels": true,
			})
			result, err := Generate(recipe)
			if err != nil {
				t.Fatal(err)
			}
			lines := strings.Split(strings.TrimSpace(result.InputText), "\n")
			if len(lines) != 30 {
				t.Fatalf("line count = %d, want 30", len(lines))
			}
			parent := make([]int, 30)
			for index := range parent {
				parent[index] = index
			}
			var find func(int) int
			find = func(vertex int) int {
				if parent[vertex] != vertex {
					parent[vertex] = find(parent[vertex])
				}
				return parent[vertex]
			}
			for _, line := range lines[1:] {
				fields := strings.Fields(line)
				if len(fields) != 3 {
					t.Fatalf("weighted edge = %q", line)
				}
				from, _ := strconv.Atoi(fields[0])
				to, _ := strconv.Atoi(fields[1])
				from--
				to--
				rootFrom, rootTo := find(from), find(to)
				if rootFrom == rootTo {
					t.Fatalf("cycle detected at %q", line)
				}
				parent[rootFrom] = rootTo
			}
			root := find(0)
			for vertex := 1; vertex < 30; vertex++ {
				if find(vertex) != root {
					t.Fatalf("vertex %d is disconnected", vertex)
				}
			}
		})
	}
}

func TestGraphRejectsImpossibleSimpleEdgeCount(t *testing.T) {
	recipe := baseRecipe("graph", "random_dense", map[string]interface{}{
		"N": 5, "M": 100, "directed": false, "connected": false,
		"allowSelfLoop": false, "allowMultiEdge": false, "weighted": false,
	})
	_, err := Generate(recipe)
	if err == nil || !strings.Contains(err.Error(), "at most M=10") {
		t.Fatalf("error = %v, want maximum M message", err)
	}
}

func TestDAGEdgesFollowTopologicalOrder(t *testing.T) {
	recipe := baseRecipe("graph", "dag", map[string]interface{}{
		"N": 8, "M": 12, "directed": true, "connected": true,
		"allowSelfLoop": false, "allowMultiEdge": false, "weighted": false,
	})
	result, err := Generate(recipe)
	if err != nil {
		t.Fatal(err)
	}
	for _, line := range strings.Split(strings.TrimSpace(result.InputText), "\n")[1:] {
		fields := strings.Fields(line)
		from, _ := strconv.Atoi(fields[0])
		to, _ := strconv.Atoi(fields[1])
		if from >= to {
			t.Fatalf("DAG edge does not follow order: %q", line)
		}
	}
}

func TestDisconnectedGraphHasNoCrossPartitionEdges(t *testing.T) {
	recipe := baseRecipe("graph", "disconnected", map[string]interface{}{
		"N": 8, "M": 8, "directed": false, "connected": false,
		"allowSelfLoop": false, "allowMultiEdge": false, "weighted": false,
	})
	result, err := Generate(recipe)
	if err != nil {
		t.Fatal(err)
	}
	for _, line := range strings.Split(strings.TrimSpace(result.InputText), "\n")[1:] {
		fields := strings.Fields(line)
		from, _ := strconv.Atoi(fields[0])
		to, _ := strconv.Atoi(fields[1])
		if (from <= 4) != (to <= 4) {
			t.Fatalf("cross-partition edge: %q", line)
		}
	}
}
