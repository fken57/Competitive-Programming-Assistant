package randomgen

import (
	"fmt"
	"strconv"
	"strings"
)

var graphCaseTypes = map[string]bool{
	"random_sparse": true, "random_dense": true, "tree": true,
	"dag": true, "cycle_heavy": true, "disconnected": true,
}

type graphParams struct {
	n              int
	m              int
	directed       bool
	connected      bool
	allowSelfLoop  bool
	allowMultiEdge bool
	weighted       bool
	minWeight      int
	maxWeight      int
}

func GenerateGraph(recipe GenerationRecipe, rng *SplitMix64) (string, error) {
	params, err := parseGraphParams(recipe)
	if err != nil {
		return "", err
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
		edges, generateErr := generateGraphEdges(params, recipe.CaseType, rng)
		if generateErr != nil {
			return "", generateErr
		}
		fmt.Fprintf(&builder, "%d %d\n", params.n, len(edges))
		for _, edge := range edges {
			builder.WriteString(strconv.Itoa(edge.from + recipe.OutputFormat.IndexBase))
			builder.WriteByte(' ')
			builder.WriteString(strconv.Itoa(edge.to + recipe.OutputFormat.IndexBase))
			if params.weighted {
				builder.WriteByte(' ')
				builder.WriteString(strconv.Itoa(rng.IntRange(params.minWeight, params.maxWeight)))
			}
			builder.WriteByte('\n')
		}
		if builder.Len() > MaxOutputBytes {
			return "", fmt.Errorf("generated input exceeds 10 MiB")
		}
	}
	return builder.String(), nil
}

func parseGraphParams(recipe GenerationRecipe) (graphParams, error) {
	if !graphCaseTypes[recipe.CaseType] {
		return graphParams{}, fmt.Errorf("unsupported graph caseType: %s", recipe.CaseType)
	}
	n, err := IntParam(recipe.Params, "N")
	if err != nil {
		return graphParams{}, err
	}
	m, err := IntParam(recipe.Params, "M")
	if err != nil {
		return graphParams{}, err
	}
	directed, err := BoolParam(recipe.Params, "directed")
	if err != nil {
		return graphParams{}, err
	}
	connected, err := BoolParam(recipe.Params, "connected")
	if err != nil {
		return graphParams{}, err
	}
	allowSelfLoop, err := BoolParam(recipe.Params, "allowSelfLoop")
	if err != nil {
		return graphParams{}, err
	}
	allowMultiEdge, err := BoolParam(recipe.Params, "allowMultiEdge")
	if err != nil {
		return graphParams{}, err
	}
	weighted, err := BoolParam(recipe.Params, "weighted")
	if err != nil {
		return graphParams{}, err
	}
	if n < 1 || n > MaxN {
		return graphParams{}, fmt.Errorf("N must be between 1 and %d", MaxN)
	}
	if m < 0 || m > MaxGraphEdges {
		return graphParams{}, fmt.Errorf("M must be between 0 and %d", MaxGraphEdges)
	}

	params := graphParams{
		n: n, m: m, directed: directed, connected: connected,
		allowSelfLoop: allowSelfLoop, allowMultiEdge: allowMultiEdge,
		weighted: weighted, minWeight: 1, maxWeight: 1,
	}
	if weighted {
		params.minWeight, err = IntParam(recipe.Params, "minWeight")
		if err != nil {
			return graphParams{}, err
		}
		params.maxWeight, err = IntParam(recipe.Params, "maxWeight")
		if err != nil {
			return graphParams{}, err
		}
		if params.minWeight < MinAllowedValue || params.maxWeight > MaxAllowedValue || params.minWeight > params.maxWeight {
			return graphParams{}, fmt.Errorf("weights must satisfy %d <= minWeight <= maxWeight <= %d", MinAllowedValue, MaxAllowedValue)
		}
	}
	if err := validateGraphCombination(params, recipe.CaseType); err != nil {
		return graphParams{}, err
	}
	return params, nil
}

func validateGraphCombination(params graphParams, caseType string) error {
	if caseType == "tree" {
		if params.directed || !params.connected || params.allowSelfLoop || params.allowMultiEdge || params.m != params.n-1 {
			return fmt.Errorf("tree requires directed=false, connected=true, no loops, no multi-edges, and M=N-1")
		}
	}
	if caseType == "dag" && (!params.directed || params.allowSelfLoop) {
		return fmt.Errorf("dag requires directed=true and allowSelfLoop=false")
	}
	if caseType == "disconnected" {
		if params.connected {
			return fmt.Errorf("disconnected requires connected=false")
		}
		if params.n < 2 {
			return fmt.Errorf("disconnected requires N >= 2")
		}
		if params.n == 2 && !params.allowSelfLoop && params.m > 0 {
			return fmt.Errorf("this disconnected configuration allows at most M=0")
		}
	}
	if params.connected && params.m < params.n-1 {
		return fmt.Errorf("connected graph requires M >= N-1")
	}
	if caseType == "cycle_heavy" && params.n >= 3 && params.m < params.n {
		return fmt.Errorf("cycle_heavy requires M >= N")
	}

	if !params.allowMultiEdge {
		maxEdges := maximumSimpleEdges(params.n, params.directed, params.allowSelfLoop)
		if caseType == "dag" {
			maxEdges = int64(params.n) * int64(params.n-1) / 2
		}
		if caseType == "disconnected" {
			left := params.n / 2
			right := params.n - left
			maxEdges = maximumSimpleEdges(left, params.directed, params.allowSelfLoop) +
				maximumSimpleEdges(right, params.directed, params.allowSelfLoop)
		}
		if int64(params.m) > maxEdges {
			return fmt.Errorf("this configuration allows at most M=%d", maxEdges)
		}
	}
	return nil
}

func maximumSimpleEdges(n int, directed, allowSelfLoop bool) int64 {
	if directed {
		if allowSelfLoop {
			return int64(n) * int64(n)
		}
		return int64(n) * int64(n-1)
	}
	if allowSelfLoop {
		return int64(n) * int64(n+1) / 2
	}
	return int64(n) * int64(n-1) / 2
}

func generateGraphEdges(params graphParams, caseType string, rng *SplitMix64) ([]generatedEdge, error) {
	if caseType == "tree" {
		return generateTreeEdges(params.n, "random", rng), nil
	}

	edges := make([]generatedEdge, 0, params.m)
	seen := make(map[string]struct{}, params.m)
	addEdge := func(from, to int) bool {
		if !params.allowSelfLoop && from == to {
			return false
		}
		key := graphEdgeKey(from, to, params.directed)
		if !params.allowMultiEdge {
			if _, exists := seen[key]; exists {
				return false
			}
			seen[key] = struct{}{}
		}
		edges = append(edges, generatedEdge{from: from, to: to})
		return true
	}

	if caseType == "cycle_heavy" && params.n >= 3 {
		for vertex := 0; vertex < params.n; vertex++ {
			addEdge(vertex, (vertex+1)%params.n)
		}
	} else if caseType == "dag" && params.connected {
		for vertex := 1; vertex < params.n; vertex++ {
			addEdge(vertex-1, vertex)
		}
	} else if params.connected {
		for vertex := 1; vertex < params.n; vertex++ {
			parent := rng.Intn(vertex)
			if params.directed && rng.Intn(2) == 1 {
				addEdge(vertex, parent)
			} else {
				addEdge(parent, vertex)
			}
		}
	}

	if len(edges) > params.m {
		return nil, fmt.Errorf("M is smaller than the required base edges")
	}

	maxCandidates := candidateCount(params, caseType)
	if !params.allowMultiEdge && maxCandidates <= 2_000_000 {
		candidates := enumerateCandidates(params, caseType, seen)
		rng.Shuffle(len(candidates), func(i, j int) {
			candidates[i], candidates[j] = candidates[j], candidates[i]
		})
		needed := params.m - len(edges)
		if len(candidates) < needed {
			return nil, fmt.Errorf("not enough valid edges for this configuration")
		}
		edges = append(edges, candidates[:needed]...)
		return edges, nil
	}

	maxAttempts := max(10_000, (params.m-len(edges))*50)
	for attempts := 0; len(edges) < params.m && attempts < maxAttempts; attempts++ {
		from, to := randomEndpoints(params, caseType, rng)
		addEdge(from, to)
	}
	if len(edges) != params.m {
		return nil, fmt.Errorf("could not generate M edges without violating constraints")
	}
	return edges, nil
}

func candidateCount(params graphParams, caseType string) int64 {
	if caseType == "dag" {
		return int64(params.n) * int64(params.n-1) / 2
	}
	if caseType == "disconnected" {
		left := params.n / 2
		right := params.n - left
		return maximumSimpleEdges(left, params.directed, params.allowSelfLoop) +
			maximumSimpleEdges(right, params.directed, params.allowSelfLoop)
	}
	return maximumSimpleEdges(params.n, params.directed, params.allowSelfLoop)
}

func enumerateCandidates(params graphParams, caseType string, seen map[string]struct{}) []generatedEdge {
	candidates := make([]generatedEdge, 0)
	for from := 0; from < params.n; from++ {
		for to := 0; to < params.n; to++ {
			if !params.allowSelfLoop && from == to {
				continue
			}
			if !params.directed && from > to {
				continue
			}
			if caseType == "dag" && from >= to {
				continue
			}
			if caseType == "disconnected" && (from < params.n/2) != (to < params.n/2) {
				continue
			}
			key := graphEdgeKey(from, to, params.directed)
			if _, exists := seen[key]; exists {
				continue
			}
			candidates = append(candidates, generatedEdge{from: from, to: to})
		}
	}
	return candidates
}

func randomEndpoints(params graphParams, caseType string, rng *SplitMix64) (int, int) {
	if caseType == "disconnected" {
		split := params.n / 2
		useLeft := rng.Intn(2) == 0
		if useLeft {
			return rng.Intn(split), rng.Intn(split)
		}
		return split + rng.Intn(params.n-split), split + rng.Intn(params.n-split)
	}
	from, to := rng.Intn(params.n), rng.Intn(params.n)
	if caseType == "dag" && from > to {
		from, to = to, from
	}
	return from, to
}

func graphEdgeKey(from, to int, directed bool) string {
	if !directed && from > to {
		from, to = to, from
	}
	return strconv.Itoa(from) + ":" + strconv.Itoa(to)
}
