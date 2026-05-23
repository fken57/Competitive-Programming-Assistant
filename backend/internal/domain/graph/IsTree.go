package graph

import(
	"backend/internal/domain/graph/graphDataBase"
	"container/list"
)

func IsTree(graph graphDataBase.Graph) bool {
	if graph.VertexSize() == 0 {
		return true
	}

	visited := make([]bool, graph.VertexSize())
	queue := list.New()
	queue.PushBack(0)
	visited[0] = true
	edgeCount := 0

	for queue.Len() > 0 {
		front := queue.Front();
		current := front.Value.(int)
		queue.Remove(front)

		for _, neighbor := range graph.NeighborEdges(current) {
			if !visited[neighbor] {
				visited[neighbor] = true
				queue.PushBack(neighbor)
				edgeCount++
			}
		}
	}

	return edgeCount == graph.VertexSize()-1 && allVisited(visited)
}

func allVisited(visited []bool) bool {
	for _, v := range visited {
		if !v {
			return false
		}
	}
	return true
}