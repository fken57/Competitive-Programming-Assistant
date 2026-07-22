package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

type Bridge struct {
	From int
	To   int
}

type LowLinkResult struct {
	ArticulationPoints []int
	Bridges            []Bridge
}

func LowLink(graph graphdatabase.UnweightedGraph) LowLinkResult {
	n := graph.VertexSize()
	order := make([]int, n)
	low := make([]int, n)
	for i := range order {
		order[i] = -1
	}
	isArticulation := make([]bool, n)
	bridges := make([]Bridge, 0)
	time := 0

	var visit func(int, int)
	visit = func(vertex, parent int) {
		order[vertex] = time
		low[vertex] = time
		time++
		children := 0

		for _, next := range graph.NeighborEdges(vertex) {
			if next == parent {
				continue
			}
			if order[next] == -1 {
				children++
				visit(next, vertex)
				if low[next] < low[vertex] {
					low[vertex] = low[next]
				}
				if parent != -1 && low[next] >= order[vertex] {
					isArticulation[vertex] = true
				}
				if low[next] > order[vertex] {
					bridges = append(bridges, Bridge{From: vertex, To: next})
				}
			} else if order[next] < low[vertex] {
				low[vertex] = order[next]
			}
		}
		if parent == -1 && children >= 2 {
			isArticulation[vertex] = true
		}
	}

	for vertex := 0; vertex < n; vertex++ {
		if order[vertex] == -1 {
			visit(vertex, -1)
		}
	}

	articulationPoints := make([]int, 0)
	for vertex, value := range isArticulation {
		if value {
			articulationPoints = append(articulationPoints, vertex)
		}
	}
	return LowLinkResult{ArticulationPoints: articulationPoints, Bridges: bridges}
}
