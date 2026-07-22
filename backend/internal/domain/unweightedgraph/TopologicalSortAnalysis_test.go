package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
	"reflect"
	"testing"
)

func TestAnalyzeTopologicalSortReturnsOrderForDAG(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedOrderedGraph(4, [][2]int{{0, 1}, {0, 2}, {1, 3}, {2, 3}})
	if err != nil {
		t.Fatal(err)
	}

	result := AnalyzeTopologicalSort(graph)
	if !result.Sortable {
		t.Fatalf("expected sortable graph, cycle = %v", result.Cycle)
	}
	if want := []int{0, 1, 2, 3}; !reflect.DeepEqual(result.Vertices, want) {
		t.Fatalf("vertices = %v, want %v", result.Vertices, want)
	}
	if len(result.Cycle) != 0 {
		t.Fatalf("cycle = %v", result.Cycle)
	}
}

func TestAnalyzeTopologicalSortReturnsCycleWitness(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedOrderedGraph(4, [][2]int{{0, 1}, {1, 2}, {2, 0}, {2, 3}})
	if err != nil {
		t.Fatal(err)
	}

	result := AnalyzeTopologicalSort(graph)
	if result.Sortable {
		t.Fatalf("expected graph with a cycle, vertices = %v", result.Vertices)
	}
	if len(result.Vertices) != 0 {
		t.Fatalf("vertices = %v", result.Vertices)
	}
	if len(result.Cycle) < 2 || result.Cycle[0] != result.Cycle[len(result.Cycle)-1] {
		t.Fatalf("cycle = %v", result.Cycle)
	}
}
