package unweightedgraph

import (
	"backend/internal/domain/unweightedgraph/graphdatabase"
	"reflect"
	"sort"
	"testing"
)

func TestDFS(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedOrderedGraph(4, [][2]int{{0, 1}, {0, 2}, {1, 3}})
	if err != nil {
		t.Fatal(err)
	}
	result := DFS(graph, 0)
	if !reflect.DeepEqual(result.PreOrder, []int{0, 1, 3, 2}) {
		t.Fatalf("preorder = %v", result.PreOrder)
	}
	if !reflect.DeepEqual(result.PostOrder, []int{3, 1, 2, 0}) {
		t.Fatalf("postorder = %v", result.PostOrder)
	}
}

func TestConnectedComponentsAndUnionFind(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(5, [][2]int{{0, 1}, {2, 3}})
	if err != nil {
		t.Fatal(err)
	}
	want := [][]int{{0, 1}, {2, 3}, {4}}
	if got := ConnectedComponents(graph); !reflect.DeepEqual(got, want) {
		t.Fatalf("components = %v, want %v", got, want)
	}
	if got := UnionFindComponents(graph).Components; !reflect.DeepEqual(got, want) {
		t.Fatalf("union-find components = %v, want %v", got, want)
	}
}

func TestFindDirectedCycle(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedOrderedGraph(4, [][2]int{{0, 1}, {1, 2}, {2, 0}, {2, 3}})
	if err != nil {
		t.Fatal(err)
	}
	cycle := FindDirectedCycle(graph)
	if len(cycle) < 2 || cycle[0] != cycle[len(cycle)-1] {
		t.Fatalf("cycle = %v", cycle)
	}
}

func TestLowLink(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(6, [][2]int{{0, 1}, {1, 2}, {1, 3}, {3, 4}, {3, 5}, {4, 5}})
	if err != nil {
		t.Fatal(err)
	}
	result := LowLink(graph)
	if !reflect.DeepEqual(result.ArticulationPoints, []int{1, 3}) {
		t.Fatalf("articulation points = %v", result.ArticulationPoints)
	}
	bridges := make([][2]int, len(result.Bridges))
	for index, bridge := range result.Bridges {
		if bridge.From > bridge.To {
			bridge.From, bridge.To = bridge.To, bridge.From
		}
		bridges[index] = [2]int{bridge.From, bridge.To}
	}
	sort.Slice(bridges, func(i, j int) bool {
		return bridges[i][0] < bridges[j][0] || bridges[i][0] == bridges[j][0] && bridges[i][1] < bridges[j][1]
	})
	want := [][2]int{{0, 1}, {1, 2}, {1, 3}}
	if !reflect.DeepEqual(bridges, want) {
		t.Fatalf("bridges = %v, want %v", bridges, want)
	}
}

func TestLowestCommonAncestors(t *testing.T) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(6, [][2]int{{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}})
	if err != nil {
		t.Fatal(err)
	}
	queries := []LCAQuery{{Left: 3, Right: 4}, {Left: 3, Right: 5}, {Left: 2, Right: 5}}
	if got, want := LowestCommonAncestors(graph, 0, queries), []int{1, 0, 2}; !reflect.DeepEqual(got, want) {
		t.Fatalf("lcas = %v, want %v", got, want)
	}
}
