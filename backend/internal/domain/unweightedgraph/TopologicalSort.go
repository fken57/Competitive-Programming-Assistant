package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

func TopologicalSort(graph graphdatabase.UnweightedGraph) ([]int, error) {
	//degrees , err := GetVerticalDegree(graph);
	//if err != nil {
		//return nil, err
	//}
	// Implementation for topological sort would go here
	return nil, nil
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