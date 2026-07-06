package handler

import "backend/internal/domain/weightedgraph/graphdatabase"

type CostGraphNeighborListRequest struct {
	VertexCount int                          `json:"vertex_count"`
	Neighbors   [][]graphdatabase.WeightedEdge `json:"neighbors"`
	StartVertex int                          `json:"start_vertex"`
}

type DijkstraResponse struct {
	StartVertex int   `json:"start_vertex"`
	Distances   []int `json:"distances"`
	Previous    []int `json:"previous"`
}
