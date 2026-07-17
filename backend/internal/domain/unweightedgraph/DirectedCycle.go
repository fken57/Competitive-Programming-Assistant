package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

// FindDirectedCycle returns one directed cycle. The first vertex is repeated at
// the end so the result can be displayed as a closed path.
func FindDirectedCycle(graph graphdatabase.UnweightedGraph) []int {
	state := make([]int, graph.VertexSize()) // 0: unvisited, 1: visiting, 2: done
	parent := make([]int, graph.VertexSize())
	for i := range parent {
		parent[i] = -1
	}

	var cycle []int
	var visit func(int) bool
	visit = func(vertex int) bool {
		state[vertex] = 1
		for _, next := range graph.NeighborEdges(vertex) {
			if state[next] == 0 {
				parent[next] = vertex
				if visit(next) {
					return true
				}
			} else if state[next] == 1 {
				path := []int{vertex}
				for current := vertex; current != next; {
					current = parent[current]
					path = append(path, current)
				}
				for left, right := 0, len(path)-1; left < right; left, right = left+1, right-1 {
					path[left], path[right] = path[right], path[left]
				}
				cycle = append(path, next)
				return true
			}
		}
		state[vertex] = 2
		return false
	}

	for vertex := 0; vertex < graph.VertexSize(); vertex++ {
		if state[vertex] == 0 && visit(vertex) {
			return cycle
		}
	}
	return nil
}
