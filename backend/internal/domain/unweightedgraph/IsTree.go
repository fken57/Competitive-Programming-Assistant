package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

// IsTree checks whether an undirected simple graph is a tree.
// It returns true iff the graph is connected and contains no cycles.
func IsTree(graph graphdatabase.UnweightedGraph) bool {
	n := graph.VertexSize()
	if n == 0 {
		return true
	}

	visited := make([]bool, n)

	type pair struct{ cur, parent int }
	stack := []pair{{0, -1}}
	visited[0] = true
	visitedCount := 0

	for len(stack) > 0 {
		p := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		visitedCount++

		for _, nb := range graph.NeighborEdges(p.cur) {
			if !visited[nb] {
				visited[nb] = true
				stack = append(stack, pair{nb, p.cur})
			} else if nb != p.parent {
				// visited neighbor that's not the parent => cycle
				return false
			}
		}
	}

	// connected iff we visited all vertices
	return visitedCount == n
}
