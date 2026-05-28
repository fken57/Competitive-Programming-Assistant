package main

import (
	"backend/internal/domain/unweightedgraph"
	"backend/internal/domain/unweightedgraph/graphdatabase"
	"fmt"
)

func main() {
	tests := []struct {
		name  string
		v     int
		edges [][2]int
		want  bool
	}{
		{"simple tree", 3, [][2]int{{0, 1}, {0, 2}}, true},
		{"simple cycle", 3, [][2]int{{0, 1}, {1, 2}, {2, 0}}, false},
		{"disconnected", 3, [][2]int{{0, 1}}, false},
		{"single vertex", 1, [][2]int{}, true},
	}

	for _, tt := range tests {
		g, err := graphdatabase.CreateNewUnweightedUnorderedGraph(tt.v, tt.edges)
		if err != nil {
			fmt.Printf("%s: create error: %v\n", tt.name, err)
			continue
		}
		got := unweightedgraph.IsTree(g)
		fmt.Printf("%s: got=%v want=%v\n", tt.name, got, tt.want)
	}
}
