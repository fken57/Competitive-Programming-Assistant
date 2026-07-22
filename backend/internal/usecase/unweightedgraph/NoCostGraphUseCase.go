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

func (g *NoCostGraphUseCase) ExecuteIsBinaryTree(graph graphdatabase.UnweightedGraph) (bool, []int, []int, []int, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return false, nil, nil, nil, errors.New("the graph is not an undirected graph")
	}
	isBinaryTree := unweightedgraph.IsBinaryGraph(graph)

	var groups1, group2 []int

	if !isBinaryTree.IsBinary {
		return false, nil, nil, isBinaryTree.OddCycle, nil
	}

	for i := 0; i < graph.VertexSize(); i++ {
		if isBinaryTree.Colors[i] == 0 {
			groups1 = append(groups1, i)
		} else {
			group2 = append(group2, i)
		}
	}

	return isBinaryTree.IsBinary, groups1, group2, nil, nil
}

func (g *NoCostGraphUseCase) GetTreeDistance(graph graphdatabase.UnweightedGraph) (unweightedgraph.TreeDistance, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return unweightedgraph.TreeDistance{}, errors.New("the graph is not an undirected graph")
	}
	if !unweightedgraph.IsTree(graph) {
		return unweightedgraph.TreeDistance{}, errors.New("the graph is not a tree")
	}
	treeDistance := unweightedgraph.GetTreeDistance(graph)
	return treeDistance, nil
}

func (g *NoCostGraphUseCase) TopologicalSort(graph graphdatabase.UnweightedGraph) (unweightedgraph.TopologicalSortAnalysis, error) {
	return unweightedgraph.AnalyzeTopologicalSort(graph), nil
}

func (g *NoCostGraphUseCase) ExecuteIsTree(graph graphdatabase.UnweightedGraph) (unweightedgraph.TreeAnalysis, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return unweightedgraph.TreeAnalysis{}, errors.New("the graph is not an undirected graph")
	}
	return unweightedgraph.AnalyzeTree(graph), nil
}

func (g *NoCostGraphUseCase) ExecuteSCC(graph graphdatabase.UnweightedGraph) ([][]int, error) {
	sccs := unweightedgraph.SCC(graph)
	return sccs, nil
}

func (g *NoCostGraphUseCase) ExecuteDFS(graph graphdatabase.UnweightedGraph, startVertex int) (unweightedgraph.DFSResult, error) {
	if startVertex < 0 || startVertex >= graph.VertexSize() {
		return unweightedgraph.DFSResult{}, errors.New("start vertex is out of range")
	}
	return unweightedgraph.DFS(graph, startVertex), nil
}

func (g *NoCostGraphUseCase) GetConnectedComponents(graph graphdatabase.UnweightedGraph) ([][]int, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return nil, errors.New("the graph is not an undirected graph")
	}
	return unweightedgraph.ConnectedComponents(graph), nil
}

func (g *NoCostGraphUseCase) DetectDirectedCycle(graph graphdatabase.UnweightedGraph) ([]int, error) {
	return unweightedgraph.FindDirectedCycle(graph), nil
}

func (g *NoCostGraphUseCase) ExecuteUnionFind(graph graphdatabase.UnweightedGraph) (unweightedgraph.UnionFindResult, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return unweightedgraph.UnionFindResult{}, errors.New("the graph is not an undirected graph")
	}
	return unweightedgraph.UnionFindComponents(graph), nil
}

func (g *NoCostGraphUseCase) GetLowLink(graph graphdatabase.UnweightedGraph) (unweightedgraph.LowLinkResult, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return unweightedgraph.LowLinkResult{}, errors.New("the graph is not an undirected graph")
	}
	return unweightedgraph.LowLink(graph), nil
}

func (g *NoCostGraphUseCase) GetLCA(graph graphdatabase.UnweightedGraph, root int, queries []unweightedgraph.LCAQuery) ([]int, error) {
	if !unweightedgraph.IsUndirectedGraph(graph) {
		return nil, errors.New("the graph is not an undirected graph")
	}
	if !unweightedgraph.IsTree(graph) {
		return nil, errors.New("the graph is not a tree")
	}
	if root < 0 || root >= graph.VertexSize() {
		return nil, errors.New("root vertex is out of range")
	}
	for _, query := range queries {
		if query.Left < 0 || query.Left >= graph.VertexSize() || query.Right < 0 || query.Right >= graph.VertexSize() {
			return nil, errors.New("query vertex is out of range")
		}
	}
	return unweightedgraph.LowestCommonAncestors(graph, root, queries), nil
}
