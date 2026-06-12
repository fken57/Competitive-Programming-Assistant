package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
	"container/list"
	"errors"
)

func TopologicalSort(graph graphdatabase.UnweightedGraph) ([]int, error) {
	degrees, err := GetVerticalDegree(graph)
	if err != nil {
		return nil, err
	}

	queue := list.New()
	for i := 0; i < graph.VertexSize(); i++ {
		if degrees[i] == 0 {
			queue.PushBack(i)
		}
	}

	result := make([]int, 0,0)
	for queue.Len() > 0 {
		current := queue.Remove(queue.Front()).(int)
		result = append(result, current)

		for _, neighbor := range graph.NeighborEdges(current) {
			degrees[neighbor]--
			if degrees[neighbor] == 0 {
				queue.PushBack(neighbor)
			}
		}
	}

	if len(result) != graph.VertexSize() {
		return nil, errors.New("graph has a cycle")
	}

	return result, nil
}

func GetVerticalDegree(graph graphdatabase.	UnweightedGraph) ([]int, error) {
	degrees := make([]int, graph.VertexSize())
	for i:= 0; i< graph.VertexSize(); i++ {
		degrees[i] = 0
	}
	for i := 0; i < graph.VertexSize(); i++ {
		for _ , to := range graph.NeighborEdges(i) {
			degrees[to]++
		}
	}
	return degrees, nil
}