package weightedgraph

import (
	"backend/internal/domain/weightedgraph/graphdatabase"
	"testing"
)

func TestPrim(t *testing.T) {
	graph, err := graphdatabase.CreateNewWeightedNeighborListGraph(4, [][]graphdatabase.WeightedEdge{
		{{To: 1, Weight: 1}, {To: 2, Weight: 4}},
		{{To: 0, Weight: 1}, {To: 2, Weight: 2}, {To: 3, Weight: 5}},
		{{To: 0, Weight: 4}, {To: 1, Weight: 2}, {To: 3, Weight: 1}},
		{{To: 1, Weight: 5}, {To: 2, Weight: 1}},
	})
	if err != nil {
		t.Fatal(err)
	}
	result := Prim(graph)
	if !result.IsSpanning || result.TotalWeight != 4 || len(result.Edges) != 3 {
		t.Fatalf("prim result = %+v", result)
	}
}

func TestWeightedTreeDiameter(t *testing.T) {
	graph, err := graphdatabase.CreateNewWeightedNeighborListGraph(4, [][]graphdatabase.WeightedEdge{
		{{To: 1, Weight: 3}},
		{{To: 0, Weight: 3}, {To: 2, Weight: 4}, {To: 3, Weight: 2}},
		{{To: 1, Weight: 4}},
		{{To: 1, Weight: 2}},
	})
	if err != nil {
		t.Fatal(err)
	}
	result, err := WeightedTreeDiameter(graph)
	if err != nil {
		t.Fatal(err)
	}
	if result.Diameter != 7 || !((result.Vertex1 == 0 && result.Vertex2 == 2) || (result.Vertex1 == 2 && result.Vertex2 == 0)) {
		t.Fatalf("diameter result = %+v", result)
	}
}
