package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

type TreeDistance struct {
	TreeDir int
	Vertex1 int
	Vertex2 int
}

func GetTreeDistance(graph graphdatabase.UnweightedGraph) TreeDistance {
	startVertex := 0
	distOne := BFS(graph, startVertex);

	nextStartVertex := -1
	nextMaxDir := -1

	for i := 0; i < graph.VertexSize(); i++ {
		if(nextMaxDir < distOne[i]) {
			nextMaxDir = distOne[i]
			nextStartVertex = i
		}
	}

	distTwo := BFS(graph, nextStartVertex)

	MaxDir := -1
	anotherEdge := -1
	for i := 0; i < graph.VertexSize(); i++ {
		if(MaxDir < distTwo[i]) {
			MaxDir = distTwo[i]
			if(i != nextStartVertex) {
				anotherEdge = i
			}
		}
	}

	return TreeDistance{
		TreeDir: MaxDir,
		Vertex1: nextStartVertex,
		Vertex2: anotherEdge, // This would need to be determined based on the actual implementation
	}
}