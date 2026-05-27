package graphusecase

import (
	"backend/internal/domain/unweightedgraph"
	"backend/internal/domain/unweightedgraph/graphdatabase"

	"errors"
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

func (g *NoCostGraphUseCase) MakeNewNoCostNeighborListGraph(vertexCount int, neighbors [][]int) (graphdatabase.UnweightedGraph, error) {
	graph, err := graphdatabase.CreateNewUnweightedNeighborListGraph(vertexCount, neighbors)
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

func (g *NoCostGraphUseCase) ExecuteBFS(graph graphdatabase.UnweightedGraph, startVertex int) ([]int, error) {
	visitedVertices := unweightedgraph.BFS(graph, startVertex)
	return visitedVertices, nil
}

func (g *NoCostGraphUseCase) ExecuteIsBinaryTree(graph graphdatabase.UnweightedGraph) ( bool,  []int,[]int, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return false, nil, nil, errors.New("the graph is not an undirected graph")
	}
	isBinaryTree := unweightedgraph.IsBinaryGraph(graph)

	var groups1, group2 []int

	if(!isBinaryTree.IsBinary) {
		return false , nil ,nil, nil
	}

	for i := 0; i < graph.VertexSize(); i++ {
		if isBinaryTree.Colors[i] == 0 {
			groups1 = append(groups1, i)
		} else {
			group2 = append(group2, i)
		}
	}

	return isBinaryTree.IsBinary, groups1, group2, nil
}