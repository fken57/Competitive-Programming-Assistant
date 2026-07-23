package handler

import (
	"backend/internal/domain/weightedgraph/graphdatabase"
	"testing"
)

func TestValidateDijkstraRequestRejectsNegativeEdgeWeight(t *testing.T) {
	req := CostGraphNeighborListRequest{
		VertexCount: 2,
		Neighbors: [][]graphdatabase.WeightedEdge{
			{{To: 1, Weight: -1}},
			{{To: 0, Weight: -1}},
		},
	}

	if err := validateDijkstraRequest(req); err == nil {
		t.Fatal("expected a negative edge weight to be rejected")
	}
}
