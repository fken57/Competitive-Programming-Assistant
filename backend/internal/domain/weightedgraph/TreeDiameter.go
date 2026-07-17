package weightedgraph

import (
	"backend/internal/domain/weightedgraph/graphdatabase"
	"errors"
)

type TreeDiameter struct {
	Diameter int
	Vertex1  int
	Vertex2  int
}

func IsUndirectedWeightedGraph(graph graphdatabase.WeightedGraph) bool {
	for from := 0; from < graph.VertexSize(); from++ {
		for _, edge := range graph.NeighborEdges(from) {
			found := false
			for _, reverse := range graph.NeighborEdges(edge.To) {
				if reverse.To == from && reverse.Weight == edge.Weight {
					found = true
					break
				}
			}
			if !found {
				return false
			}
		}
	}
	return true
}

func IsWeightedTree(graph graphdatabase.WeightedGraph) bool {
	if graph.VertexSize() == 0 || !IsUndirectedWeightedGraph(graph) {
		return false
	}
	visited := make([]bool, graph.VertexSize())
	type entry struct{ vertex, parent int }
	stack := []entry{{vertex: 0, parent: -1}}
	visited[0] = true
	count := 0
	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		count++
		for _, edge := range graph.NeighborEdges(current.vertex) {
			if edge.To == current.parent {
				continue
			}
			if visited[edge.To] {
				return false
			}
			visited[edge.To] = true
			stack = append(stack, entry{vertex: edge.To, parent: current.vertex})
		}
	}
	return count == graph.VertexSize()
}

func WeightedTreeDiameter(graph graphdatabase.WeightedGraph) (TreeDiameter, error) {
	if !IsWeightedTree(graph) {
		return TreeDiameter{}, errors.New("the graph is not an undirected tree")
	}
	for vertex := 0; vertex < graph.VertexSize(); vertex++ {
		for _, edge := range graph.NeighborEdges(vertex) {
			if edge.Weight < 0 {
				return TreeDiameter{}, errors.New("tree diameter does not support negative weights")
			}
		}
	}

	farthest := func(start int) (int, int) {
		type entry struct {
			vertex   int
			parent   int
			distance int
		}
		bestVertex, bestDistance := start, 0
		stack := []entry{{vertex: start, parent: -1, distance: 0}}
		for len(stack) > 0 {
			current := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			if current.distance > bestDistance {
				bestVertex, bestDistance = current.vertex, current.distance
			}
			for _, edge := range graph.NeighborEdges(current.vertex) {
				if edge.To != current.parent {
					stack = append(stack, entry{vertex: edge.To, parent: current.vertex, distance: current.distance + edge.Weight})
				}
			}
		}
		return bestVertex, bestDistance
	}

	vertex1, _ := farthest(0)
	vertex2, diameter := farthest(vertex1)
	return TreeDiameter{Diameter: diameter, Vertex1: vertex1, Vertex2: vertex2}, nil
}
