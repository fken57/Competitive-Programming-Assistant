package weightedgraph

import (
	"backend/internal/domain/weightedgraph"
	"backend/internal/domain/weightedgraph/graphdatabase"
	"errors"
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
	if startVertex < 0 || startVertex >= graph.VertexSize() {
		return nil, nil, errors.New("start vertex is out of range")
	}
	dist, prev := weightedgraph.Dijkstra(graph, startVertex)
	return dist, prev, nil
}

func (g *CostGraphUseCase) ExecutePrim(graph graphdatabase.WeightedGraph) (weightedgraph.PrimResult, error) {
	if !weightedgraph.IsUndirectedWeightedGraph(graph) {
		return weightedgraph.PrimResult{}, errors.New("the graph is not an undirected graph")
	}
	return weightedgraph.Prim(graph), nil
}

func (g *CostGraphUseCase) GetTreeDiameter(graph graphdatabase.WeightedGraph) (weightedgraph.TreeDiameter, error) {
	return weightedgraph.WeightedTreeDiameter(graph)
}
