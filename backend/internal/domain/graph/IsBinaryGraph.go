package graph

import(	
	"backend/internal/domain/graph/graphDataBase"
)

type BinaryGraphInfo struct {
	IsBinary bool
	Colors []int
}

func IsBinaryGraph(graph graphDataBase.Graph) BinaryGraphInfo{
	currentColors := make([]int, graph.VertexSize());

	for i := 0; i < graph.VertexSize()	; i++{
		currentColors[i]= -1;
	}

	for i := 0; i < graph.VertexSize(); i++ {
		if currentColors[i] == -1 {
			currentColors[i] = 1
			if !IsBinaryGraphDFSLogic(graph, currentColors, i, 1) {
				return BinaryGraphInfo{IsBinary: false, Colors: nil}
			}
		}
	}
	return BinaryGraphInfo{IsBinary: true, Colors: currentColors}
}

func IsBinaryGraphDFSLogic(graph graphDataBase.Graph,colors []int,vertex int,currentColor int) bool {

	for _,neighbor := range graph.NeighborEdges(vertex) {
		if(colors[neighbor] == -1) {
			colors[neighbor] = 1 - currentColor
			if !IsBinaryGraphDFSLogic(graph, colors, neighbor, colors[neighbor]) {
				return false
			}
		} else if(colors[neighbor] == currentColor) {
			return false
		}
	}
	return true
}
