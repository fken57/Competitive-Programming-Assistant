package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

// UnweightedGraphRepository is the exported repository interface for graphs.
type UnweightedGraphRepository interface {
	SaveUnweightedGraph(graph graphdatabase.UnweightedGraph) error
	GetUnweightedGraph(graphID int) (graphdatabase.UnweightedGraph, error)
}
