package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

type DFSResult struct {
	PreOrder  []int
	PostOrder []int
	Parents   []int
}

// DFS returns the preorder and postorder for the vertices reachable from start.
func DFS(graph graphdatabase.UnweightedGraph, start int) DFSResult {
	result := DFSResult{PreOrder: []int{}, PostOrder: []int{}}
	if start < 0 || start >= graph.VertexSize() {
		return result
	}

	result.Parents = make([]int, graph.VertexSize())
	for vertex := range result.Parents {
		result.Parents[vertex] = -1
	}

	visited := make([]bool, graph.VertexSize())
	var visit func(int)
	visit = func(vertex int) {
		visited[vertex] = true
		result.PreOrder = append(result.PreOrder, vertex)
		for _, next := range graph.NeighborEdges(vertex) {
			if !visited[next] {
				result.Parents[next] = vertex
				visit(next)
			}
		}
		result.PostOrder = append(result.PostOrder, vertex)
	}

	visit(start)
	return result
}
