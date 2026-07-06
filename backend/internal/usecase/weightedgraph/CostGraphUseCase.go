package weightedgraph

import (
	"backend/internal/domain/weightedgraph"
	"backend/internal/domain/weightedgraph/graphdatabase"
)

type CostGraphUseCase struct {
	graphRepo weightedgraph.WeightedGraphRepository
}

func NewCostGraphUseCase(graphRepo weightedgraph.WeightedGraphRepository) *CostGraphUseCase {
	return &CostGraphUseCase{
		graphRepo: graphRepo,
	}
}

func (g *CostGraphUseCase) MakeNewCostOrderedGraph(vertexCount int, edges [][3]int) (graphdatabase.WeightedGraph, error) {
	graph, err := graphdatabase.CreateNewWeightedOrderedGraph(vertexCount, edges)
	if err != nil {
		var emptyGraph graphdatabase.WeightedGraph
		return emptyGraph, err
	}
	return graph, nil
}

func (g *CostGraphUseCase) MakeNewCostNeighborListGraph(vertexCount int, neighbors [][]graphdatabase.WeightedEdge) (graphdatabase.WeightedGraph, error) {
	graph, err := graphdatabase.CreateNewWeightedNeighborListGraph(vertexCount, neighbors)
	if err != nil {
		var emptyGraph graphdatabase.WeightedGraph
		return emptyGraph, err
	}
	return graph, nil
}

func (g *CostGraphUseCase) ExecuteDijkstra(graph graphdatabase.WeightedGraph, startVertex int) ([]int, []int, error) {
	dist, prev := weightedgraph.Dijkstra(graph, startVertex)
	return dist, prev, nil
}
