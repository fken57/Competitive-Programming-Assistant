package unweightedgraph

import(
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

func SCC(graph graphdatabase.UnweightedGraph) [][]int {
	n := graph.VertexSize()
	index := 0
	indices := make([]int, n)
	lowlink := make([]int, n)
	onStack := make([]bool, n)
	var stack []int

	for i := 0; i < n; i++ {
		indices[i] = -1
	}

	var sccs [][]int

	var strongconnect func(v int)
	strongconnect = func(v int) {
		indices[v] = index
		lowlink[v] = index
		index++
		stack = append(stack, v)
		onStack[v] = true

		for _, w := range graph.NeighborEdges(v) {
			if indices[w] == -1 {
				strongconnect(w)
				if lowlink[w] < lowlink[v] {
					lowlink[v] = lowlink[w]
				}
			} else if onStack[w] {
				if indices[w] < lowlink[v] {
					lowlink[v] = indices[w]
				}
			}
		}

		if lowlink[v] == indices[v] {
			var scc []int
			for {
				w := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				onStack[w] = false
				scc = append(scc, w)
				if w == v {
					break
				}
			}
			sccs = append(sccs, scc)
		}
	}

	for i := 0; i < n; i++ {
		if indices[i] == -1 {
			strongconnect(i)
		}
	}

	return sccs
}