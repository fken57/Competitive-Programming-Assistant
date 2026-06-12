package main

import(
	"backend/internal/domain/unweightedgraph"
	"backend/internal/domain/unweightedgraph/graphdatabase"

	"fmt"
)

func main(){
	tests := []struct {
		name  string
		v     int
		edges [][2]int
		want []int
	}{
		{"simple tree", 3, [][2]int{{0, 1}, {0, 2}}, []int{0, 1, 2}},
		{"simple cycle", 3, [][2]int{{0, 1}, {1, 2}, {2, 0}}, nil},
		{"disconnected", 3, [][2]int{{0, 1}}, []int{0, 2, 1}},
		{"single vertex", 1, [][2]int{}, []int{0}},
		{"complex DAG", 4, [][2]int{{0, 1}, {0, 2}, {1, 3}, {2, 3}}, []int{0, 1, 2, 3}},
	}

	for _, tt := range tests {
		g, err := graphdatabase.CreateNewUnweightedOrderedGraph(tt.v, tt.edges)
		if err != nil {
			fmt.Printf("%s: create error: %v\n", tt.name, err)
			continue
		}
		got, err := unweightedgraph.TopologicalSort(g)
		if err != nil {
			fmt.Printf("%s: sort error: %v\n", tt.name, err)
			continue
		}
		fmt.Printf("%s: got=%v want=%v\n", tt.name, got, tt.want)
	}
}