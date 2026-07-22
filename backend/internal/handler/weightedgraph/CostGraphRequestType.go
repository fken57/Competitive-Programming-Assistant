package handler

import "backend/internal/domain/weightedgraph/graphdatabase"

type CostGraphNeighborListRequest struct {
	VertexCount int                            `json:"vertex_count"`
	Neighbors   [][]graphdatabase.WeightedEdge `json:"neighbors"`
	StartVertex int                            `json:"start_vertex"`
}

type DijkstraResponse struct {
	StartVertex int   `json:"start_vertex"`
	Distances   []int `json:"distances"`
	Previous    []int `json:"previous"`
}

type MSTEdgeResponse struct {
	From   int `json:"from"`
	To     int `json:"to"`
	Weight int `json:"weight"`
}

type PrimResponse struct {
	IsSpanning  bool              `json:"is_spanning"`
	TotalWeight int               `json:"total_weight"`
	Edges       []MSTEdgeResponse `json:"edges"`
}

type TreeDiameterResponse struct {
	Diameter int `json:"diameter"`
	Vertex1  int `json:"vertex1"`
	Vertex2  int `json:"vertex2"`
}
