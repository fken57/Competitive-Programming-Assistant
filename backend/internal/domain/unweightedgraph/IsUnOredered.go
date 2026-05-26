package unweightedgraph

import(
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

func IsUndirectedGraph(graph graphdatabase.UnweightedGraph) bool {
    size := graph.VertexSize()
    for u := 0; u < size; u++ {
        for _, v := range graph.NeighborEdges(u) {
            if !hasEdge(graph, v, u) {
                return false 
            }
        }
    }
    return true
}

func hasEdge(graph graphdatabase.UnweightedGraph, from, to int) bool {
    for _, neighbor := range graph.NeighborEdges(from) {
        if neighbor == to {
            return true
        }
    }
    return false
}