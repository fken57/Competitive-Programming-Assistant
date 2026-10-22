package functionalgraphdatabase

type FunctionalGraph struct {
	Edges    []int
	NodeSize int
}

func NewFunctionalGraph(edges []int) *FunctionalGraph {
	return &FunctionalGraph{Edges: edges}
}
