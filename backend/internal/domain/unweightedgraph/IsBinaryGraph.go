package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

type BinaryGraphInfo struct {
	IsBinary bool
	Colors   []int
	OddCycle []int
}

func IsBinaryGraph(graph graphdatabase.UnweightedGraph) BinaryGraphInfo {
	currentColors := make([]int, graph.VertexSize())
	parents := make([]int, graph.VertexSize())
	depths := make([]int, graph.VertexSize())

	for i := 0; i < graph.VertexSize(); i++ {
		currentColors[i] = -1
		parents[i] = -1
	}

	var oddCycle []int
	var visit func(int) bool
	visit = func(vertex int) bool {
		for _, neighbor := range graph.NeighborEdges(vertex) {
			if currentColors[neighbor] == -1 {
				currentColors[neighbor] = 1 - currentColors[vertex]
				parents[neighbor] = vertex
				depths[neighbor] = depths[vertex] + 1
				if !visit(neighbor) {
					return false
				}
			} else if currentColors[neighbor] == currentColors[vertex] {
				oddCycle = reconstructOddCycle(vertex, neighbor, parents, depths)
				return false
			}
		}
		return true
	}

	for i := 0; i < graph.VertexSize(); i++ {
		if currentColors[i] == -1 {
			currentColors[i] = 1
			if !visit(i) {
				return BinaryGraphInfo{IsBinary: false, Colors: currentColors, OddCycle: oddCycle}
			}
		}
	}
	return BinaryGraphInfo{IsBinary: true, Colors: currentColors}
}

func reconstructOddCycle(left, right int, parents, depths []int) []int {
	start := left
	leftPath := make([]int, 0)
	rightPath := make([]int, 0)

	for depths[left] > depths[right] {
		leftPath = append(leftPath, left)
		left = parents[left]
	}
	for depths[right] > depths[left] {
		rightPath = append(rightPath, right)
		right = parents[right]
	}
	for left != right {
		leftPath = append(leftPath, left)
		rightPath = append(rightPath, right)
		left = parents[left]
		right = parents[right]
	}
	leftPath = append(leftPath, left)
	for index := len(rightPath) - 1; index >= 0; index-- {
		leftPath = append(leftPath, rightPath[index])
	}
	return append(leftPath, start)
}
