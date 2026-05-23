package graph

import (
	"backend/internal/domain/graph"
	"backend/internal/domain/graph/graphDataBase"
)

type NoCostGraphUseCase struct {
	graphRepo graph.GraphRepository
}

func NewNoCostGraphUseCase(graphRepo graph.GraphRepository) *NoCostGraphUseCase {
	return &NoCostGraphUseCase{
		graphRepo: graphRepo,
	}
}

func (g *NoCostGraphUseCase) MakeNewNoCostUnorderedGraph(vertexCount int, edges [][2]int) (graphDataBase.Graph, error) {
	graph, err := graphDataBase.CreateNewUnorderedGraph(vertexCount, edges)
	if err != nil {
		var emptyGraph graphDataBase.Graph
		return emptyGraph, err
	}
	return graph, nil
}

func (g *NoCostGraphUseCase) MakeNewNoCostOrderedGraph(vertexCount int, edges [][2]int) (graphDataBase.Graph, error) {
	graph, err := graphDataBase.CreateNewOrderedGraph(vertexCount, edges)
	if err != nil {
		var emptyGraph graphDataBase.Graph
		return emptyGraph, err
	}
	return graph, nil
}