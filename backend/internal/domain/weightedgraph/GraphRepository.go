package weightedgraph

import (
	"backend/internal/domain/weightedgraph/graphdatabase"
)

// WeightedGraphRepository is the exported repository interface for graphs.
type WeightedGraphRepository interface {
	SaveWeightedGraph(graph graphdatabase.WeightedGraph) error
	GetWeightedGraph(graphID string) (graphdatabase.WeightedGraph, error)
}
