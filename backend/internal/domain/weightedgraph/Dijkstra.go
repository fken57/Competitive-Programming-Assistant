package weightedgraph

import (
	"backend/internal/domain/weightedgraph/graphdatabase"
	"container/heap"
)

// Item represents a node in the priority queue
type Item struct {
	vertex   int
	distance int
	index    int
}

// PriorityQueue implements heap.Interface and holds Items.
type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	// We want Pop to give us the lowest, not highest, distance so we use less than here.
	return pq[i].distance < pq[j].distance
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil  // avoid memory leak
	item.index = -1 // for safety
	*pq = old[0 : n-1]
	return item
}

// Dijkstra calculates the shortest paths from startVertex to all other vertices.
// Returns an array of shortest distances (with -1 representing unreachable nodes)
// and an array of previous vertices to reconstruct the path (with -1 representing no predecessor).
func Dijkstra(graph graphdatabase.WeightedGraph, startVertex int) ([]int, []int) {
	n := graph.VertexSize()
	dist := make([]int, n)
	prev := make([]int, n)

	const INF = int(1e9) // Represents infinity (1 billion, safe for 32-bit int)

	for i := 0; i < n; i++ {
		dist[i] = INF
		prev[i] = -1
	}

	dist[startVertex] = 0
	pq := make(PriorityQueue, 0)
	heap.Init(&pq)
	heap.Push(&pq, &Item{
		vertex:   startVertex,
		distance: 0,
	})

	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Item)
		u := item.vertex
		d := item.distance

		if d > dist[u] {
			continue
		}

		for _, edge := range graph.NeighborEdges(u) {
			v := edge.To
			weight := edge.Weight

			if dist[u]+weight < dist[v] {
				dist[v] = dist[u] + weight
				prev[v] = u
				heap.Push(&pq, &Item{
					vertex:   v,
					distance: dist[v],
				})
			}
		}
	}

	// Convert INF to -1 for unreachable nodes
	for i := 0; i < n; i++ {
		if dist[i] == INF {
			dist[i] = -1
		}
	}

	return dist, prev
}
