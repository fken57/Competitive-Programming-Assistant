package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

func ConnectedComponents(graph graphdatabase.UnweightedGraph) [][]int {
	visited := make([]bool, graph.VertexSize())
	components := make([][]int, 0)

	for start := 0; start < graph.VertexSize(); start++ {
		if visited[start] {
			continue
		}

		component := make([]int, 0)
		stack := []int{start}
		visited[start] = true
		for len(stack) > 0 {
			vertex := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			component = append(component, vertex)
			for _, next := range graph.NeighborEdges(vertex) {
				if !visited[next] {
					visited[next] = true
					stack = append(stack, next)
				}
			}
		}
		components = append(components, component)
	}

	return components
}
