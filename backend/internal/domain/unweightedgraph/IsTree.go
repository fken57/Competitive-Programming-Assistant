package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

type TreeAnalysis struct {
	IsTree     bool
	Cycle      []int
	Components [][]int
}

// AnalyzeTree returns both the tree verdict and witnesses for cycle/disconnection.
func AnalyzeTree(graph graphdatabase.UnweightedGraph) TreeAnalysis {
	n := graph.VertexSize()
	if n == 0 {
		return TreeAnalysis{IsTree: true, Components: [][]int{}}
	}

	visited := make([]bool, n)
	parents := make([]int, n)
	depths := make([]int, n)
	for i := range parents {
		parents[i] = -1
	}
	components := make([][]int, 0)
	var cycle []int

	var visit func(int, int, *[]int)
	visit = func(vertex, parent int, component *[]int) {
		visited[vertex] = true
		*component = append(*component, vertex)
		for _, next := range graph.NeighborEdges(vertex) {
			if next == parent {
				continue
			}
			if !visited[next] {
				parents[next] = vertex
				depths[next] = depths[vertex] + 1
				visit(next, vertex, component)
			} else if len(cycle) == 0 && depths[next] < depths[vertex] {
				cycle = reconstructUndirectedCycle(vertex, next, parents)
			}
		}
	}

	for start := 0; start < n; start++ {
		if visited[start] {
			continue
		}
		component := make([]int, 0)
		visit(start, -1, &component)
		components = append(components, component)
	}

	return TreeAnalysis{
		IsTree:     len(cycle) == 0 && len(components) == 1,
		Cycle:      cycle,
		Components: components,
	}
}

func reconstructUndirectedCycle(descendant, ancestor int, parents []int) []int {
	path := []int{descendant}
	for descendant != ancestor {
		descendant = parents[descendant]
		path = append(path, descendant)
	}
	for left, right := 0, len(path)-1; left < right; left, right = left+1, right-1 {
		path[left], path[right] = path[right], path[left]
	}
	return append(path, ancestor)
}

// IsTree keeps the existing boolean API for callers that only need the verdict.
func IsTree(graph graphdatabase.UnweightedGraph) bool {
	return AnalyzeTree(graph).IsTree
}
