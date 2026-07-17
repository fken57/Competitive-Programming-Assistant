package weightedgraph

import (
	"backend/internal/domain/weightedgraph/graphdatabase"
	"container/heap"
)

type MSTEdge struct {
	From   int `json:"from"`
	To     int `json:"to"`
	Weight int `json:"weight"`
}

type PrimResult struct {
	IsSpanning  bool      `json:"is_spanning"`
	TotalWeight int       `json:"total_weight"`
	Edges       []MSTEdge `json:"edges"`
}

type primItem struct {
	from   int
	to     int
	weight int
}

type primQueue []primItem

func (q primQueue) Len() int                { return len(q) }
func (q primQueue) Less(i, j int) bool      { return q[i].weight < q[j].weight }
func (q primQueue) Swap(i, j int)           { q[i], q[j] = q[j], q[i] }
func (q *primQueue) Push(value interface{}) { *q = append(*q, value.(primItem)) }
func (q *primQueue) Pop() interface{} {
	old := *q
	item := old[len(old)-1]
	*q = old[:len(old)-1]
	return item
}

// Prim computes a minimum spanning forest. IsSpanning reports whether it is a tree.
func Prim(graph graphdatabase.WeightedGraph) PrimResult {
	n := graph.VertexSize()
	visited := make([]bool, n)
	result := PrimResult{Edges: make([]MSTEdge, 0)}
	components := 0

	for start := 0; start < n; start++ {
		if visited[start] {
			continue
		}
		components++
		visited[start] = true
		queue := &primQueue{}
		heap.Init(queue)
		for _, edge := range graph.NeighborEdges(start) {
			heap.Push(queue, primItem{from: start, to: edge.To, weight: edge.Weight})
		}

		for queue.Len() > 0 {
			item := heap.Pop(queue).(primItem)
			if visited[item.to] {
				continue
			}
			visited[item.to] = true
			result.TotalWeight += item.weight
			result.Edges = append(result.Edges, MSTEdge{From: item.from, To: item.to, Weight: item.weight})
			for _, edge := range graph.NeighborEdges(item.to) {
				if !visited[edge.To] {
					heap.Push(queue, primItem{from: item.to, to: edge.To, weight: edge.Weight})
				}
			}
		}
	}

	result.IsSpanning = components <= 1
	return result
}
