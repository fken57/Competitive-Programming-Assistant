package graphDataBase

import(
	"errors"
)

type Graph interface{
	VertexSize() int
	NeighborEdges(vertex int) []int
}

type graph struct {
	vertexSize int
	edges      [][]int
}

func (g *graph) VertexSize() int {
	return g.vertexSize
}

func (g *graph) NeighborEdges(vertex int) []int {
	return g.edges[vertex]
}

/*0indexedのグラフを生成します*/
func CreateNewUnorderedGraph(vertexSize int, beforeProcessEdges [][2]int) (Graph, error) {
	if(vertexSize <= 0){
		return nil, errors.New("invalid vertex size")
	}
	g := &graph{
		vertexSize: vertexSize,
		edges : make([][]int, vertexSize),
	}

	for _ , edges := range beforeProcessEdges {
		g.edges[edges[0]] = append(g.edges[edges[0]], edges[1])
		g.edges[edges[1]] = append(g.edges[edges[1]], edges[0])	
	}

	return g, nil
}

/*0indexedの無向グラフを生成します*/
func CreateNewOrderedGraph(vertexSize int, beforeProcessEdges [][2]int) (Graph, error) {	
	if(vertexSize <= 0){
		return nil, errors.New("invalid vertex size")
	}
	g := &graph{
		vertexSize: vertexSize,
		edges:      make([][]int, vertexSize),
	}

	for _ , edges := range beforeProcessEdges {
		g.edges[edges[0]] = append(g.edges[edges[0]], edges[1])
	}

	return g, nil
}