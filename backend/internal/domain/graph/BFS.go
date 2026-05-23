package graph

import (
	"container/list"
	GraphDataStat "backend/internal/domain/graph/graphDataBase"
)


func BFS(graph GraphDataStat.Graph, start int) []int {
	visited := make([]bool, graph.VertexSize())
	result := make([]int, graph.VertexSize())

	if start < 0 || start >= graph.VertexSize() {
		return []int{}
	}

	queue := list.New()
	queue.PushBack(start)
	visited[start] = true
	result[start] = 0

	for queue.Len() > 0 {
		front := queue.Front()
		current := front.Value.(int)
		queue.Remove(front)

		for _, neighbor := range graph.NeighborEdges(current) {
			if !visited[neighbor] {
				visited[neighbor] = true
				queue.PushBack(neighbor)
				result[neighbor] = result[current] + 1
			}
		}
	}

	return result
}