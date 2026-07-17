package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

type DFSResult struct {
	PreOrder  []int
	PostOrder []int
}

// DFS returns the preorder and postorder for the vertices reachable from start.
func DFS(graph graphdatabase.UnweightedGraph, start int) DFSResult {
	result := DFSResult{PreOrder: []int{}, PostOrder: []int{}}
	if start < 0 || start >= graph.VertexSize() {
		return result
	}

	visited := make([]bool, graph.VertexSize())
	var visit func(int)
	visit = func(vertex int) {
		visited[vertex] = true
		result.PreOrder = append(result.PreOrder, vertex)
		for _, next := range graph.NeighborEdges(vertex) {
			if !visited[next] {
				visit(next)
			}
		}
		result.PostOrder = append(result.PostOrder, vertex)
	}

	visit(start)
	return result
}
