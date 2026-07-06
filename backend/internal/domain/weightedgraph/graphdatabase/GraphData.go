package graphdatabase

import (
	"errors"
)

type WeightedEdge struct {
	To     int `json:"to"`
	Weight int `json:"weight"`
}

// WeightedGraph is the exported interface representing a weighted graph.
type WeightedGraph interface {
	VertexSize() int
	NeighborEdges(vertex int) []WeightedEdge
}

type graph struct {
	vertexSize int
	edges      [][]WeightedEdge
}

func (g *graph) VertexSize() int {
	return g.vertexSize
}

func (g *graph) NeighborEdges(vertex int) []WeightedEdge {
	return g.edges[vertex]
}

/* 0indexedの有向重み付きグラフを生成します */
func CreateNewWeightedOrderedGraph(vertexSize int, beforeProcessEdges [][3]int) (WeightedGraph, error) {
	if vertexSize <= 0 {
		return nil, errors.New("invalid vertex size")
	}
	g := &graph{
		vertexSize: vertexSize,
		edges:      make([][]WeightedEdge, vertexSize),
	}

	for _, edge := range beforeProcessEdges {
		u := edge[0]
		v := edge[1]
		w := edge[2]
		g.edges[u] = append(g.edges[u], WeightedEdge{To: v, Weight: w})
	}

	return g, nil
}

func CreateNewWeightedNeighborListGraph(vertexSize int, neighbors [][]WeightedEdge) (WeightedGraph, error) {
	if vertexSize <= 0 {
		return nil, errors.New("invalid vertex size")
	}
	g := &graph{
		vertexSize: vertexSize,
		edges:      make([][]WeightedEdge, vertexSize),
	}

	for i, neighborList := range neighbors {
		g.edges[i] = append(g.edges[i], neighborList...)
	}

	return g, nil
}
