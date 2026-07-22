package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
	"testing"
)

func TestAnalyzeTreeReturnsTree(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(4, [][2]int{{0, 1}, {1, 2}, {1, 3}})
	if err != nil {
		t.Fatal(err)
	}
	result := AnalyzeTree(graph)
	if !result.IsTree || len(result.Cycle) != 0 || len(result.Components) != 1 {
		t.Fatalf("analysis = %+v", result)
	}
}

func TestAnalyzeTreeReturnsDisconnectedComponents(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(4, [][2]int{{0, 1}, {2, 3}})
	if err != nil {
		t.Fatal(err)
	}
	result := AnalyzeTree(graph)
	if result.IsTree || len(result.Cycle) != 0 || len(result.Components) != 2 {
		t.Fatalf("analysis = %+v", result)
	}
}

func TestAnalyzeTreeReturnsCycleAndComponents(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(4, [][2]int{{0, 1}, {1, 2}, {2, 0}})
	if err != nil {
		t.Fatal(err)
	}
	result := AnalyzeTree(graph)
	if result.IsTree || len(result.Cycle) != 4 || len(result.Components) != 2 {
		t.Fatalf("analysis = %+v", result)
	}
}
