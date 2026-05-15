package graph

import (
	"container/list"
	GraphDataStat "backend/internal/domain/graph/graphDataBase"
)


func BFS(graph *GraphDataStat.Graph, start int) []int {
	visited := make([]bool, graph.NodeSize)
	result := make([]int, graph.NodeSize)

	if start < 0 || start >= graph.NodeSize {
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

		for _, neighbor := range graph.Edges[current] {
			if !visited[neighbor.To] {
				visited[neighbor.To] = true
				queue.PushBack(neighbor.To)
				result[neighbor.To] = result[current] + 1
			}
		}
	}

	return result
}