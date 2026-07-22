package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
	"testing"
)

func TestIsBinaryGraphReturnsOddCycle(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(3, [][2]int{{0, 1}, {1, 2}, {2, 0}})
	if err != nil {
		t.Fatal(err)
	}
	result := IsBinaryGraph(graph)
	if result.IsBinary {
		t.Fatal("triangle must not be bipartite")
	}
	if len(result.OddCycle) != 4 || result.OddCycle[0] != result.OddCycle[len(result.OddCycle)-1] {
		t.Fatalf("odd cycle = %v", result.OddCycle)
	}
}

func TestIsBinaryGraphAcceptsEvenCycle(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(4, [][2]int{{0, 1}, {1, 2}, {2, 3}, {3, 0}})
	if err != nil {
		t.Fatal(err)
	}
	result := IsBinaryGraph(graph)
	if !result.IsBinary || len(result.OddCycle) != 0 {
		t.Fatalf("result = %+v", result)
	}
}
