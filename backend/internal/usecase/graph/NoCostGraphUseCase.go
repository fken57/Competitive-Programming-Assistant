package graph

import (
	"backend/internal/domain/unweightedgraph"
	"backend/internal/domain/unweightedgraph/graphdatabase"
)

type NoCostGraphUseCase struct {
	graphRepo unweightedgraph.UnweightedGraphRepository
}

func NewNoCostGraphUseCase(graphRepo unweightedgraph.UnweightedGraphRepository) *NoCostGraphUseCase {
	return &NoCostGraphUseCase{
		graphRepo: graphRepo,
	}
}

func (g *NoCostGraphUseCase) MakeNewNoCostUnorderedGraph(vertexCount int, edges [][2]int) (graphdatabase.UnweightedGraph, error) {
	graph, err := graphdatabase.CreateNewUnweightedUnorderedGraph(vertexCount, edges)
	if err != nil {
		var emptyGraph graphdatabase.UnweightedGraph
		return emptyGraph, err
	}
	return graph, nil
}

func (g *NoCostGraphUseCase) MakeNewNoCostOrderedGraph(vertexCount int, edges [][2]int) (graphdatabase.UnweightedGraph, error) {
	graph, err := graphdatabase.CreateNewUnweightedOrderedGraph(vertexCount, edges)
	if err != nil {
		var emptyGraph graphdatabase.UnweightedGraph
		return emptyGraph, err
	}
	return graph, nil
}
