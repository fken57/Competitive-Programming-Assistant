package graph

import(
	"backend/internal/domain/graph/graphDataBase"
	"container/list"
)

func IsTree(graph *graphDataBase.Graph) bool {
	if graph.NodeSize == 0 {
		return true
	}

	visited := make([]bool, graph.NodeSize)
	queue := list.New()
	queue.PushBack(0)
	visited[0] = true
	edgeCount := 0

	for queue.Len() > 0 {
		front := queue.Front();
		current := front.Value.(int)
		queue.Remove(front)

		for _, neighbor := range graph.Edges[current] {
			if !visited[neighbor.To] {
				visited[neighbor.To] = true
				queue.PushBack(neighbor.To)
				edgeCount++
			}
		}
	}

	return edgeCount == graph.NodeSize-1 && allVisited(visited)
}

func allVisited(visited []bool) bool {
	for _, v := range visited {
		if !v {
			return false
		}
	}
	return true
}