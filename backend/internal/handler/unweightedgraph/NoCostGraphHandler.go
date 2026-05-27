package handler

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	"errors"

	graphusecase "backend/internal/usecase/unweightedgraph"
)

type NoCostGraphHandler struct {
	noCostGraphUseCase *graphusecase.NoCostGraphUseCase
}

type GraphResponse struct {
	VertexSize int     `json:"vertex_size"`
	Edges      [][]int `json:"edges"`
}

func NewNoCostGraphHandler(noCostGraphUseCase *graphusecase.NoCostGraphUseCase) *NoCostGraphHandler {
	return &NoCostGraphHandler{
		noCostGraphUseCase: noCostGraphUseCase,
	}
}

func (h *NoCostGraphHandler) MakeNewNoCostUnorderedGraph(c echo.Context) error {
	var req NoCostGraphRequest

	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	graph, err := h.noCostGraphUseCase.MakeNewNoCostUnorderedGraph(req.VertexCount, req.Edges)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if graph == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Graph not found"})
	}

	res := GraphResponse{
		VertexSize: graph.VertexSize(),
		Edges:      [][]int{},
	}

	for i := 0; i < graph.VertexSize(); i++ {
		res.Edges = append(res.Edges, graph.NeighborEdges(i))
	}

	// 3. 詰め替えたDTOをJSONにして返す
	return c.JSON(http.StatusCreated, map[string]interface{}{"graph": res})
}

func (h *NoCostGraphHandler) MakeNewNoCostOrderedGraph(c echo.Context) error {
	var req NoCostGraphRequest

	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	graph, err := h.noCostGraphUseCase.MakeNewNoCostOrderedGraph(req.VertexCount, req.Edges)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if graph == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Graph not found"})
	}

	res := GraphResponse{
		VertexSize: graph.VertexSize(),
		Edges:      [][]int{},
	}

	for i := 0; i < graph.VertexSize(); i++ {
		res.Edges = append(res.Edges, graph.NeighborEdges(i))
	}

	for i := 0; i < graph.VertexSize(); i++ {
		for j := 0; j < len(res.Edges[i]); j++ {
			res.Edges[i][j]++
		}
	}

	// 3. 詰め替えたDTOをJSONにして返す
	return c.JSON(http.StatusCreated, map[string]interface{}{"graph": res})
}

func (h *NoCostGraphHandler) ExecuteBFS(c echo.Context) error {
	var req NoCostGraphNeighborListRequest

	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	graph, err := h.noCostGraphUseCase.MakeNewNoCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if graph == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Graph not found"})
	}

	visitedVertices, err := h.noCostGraphUseCase.ExecuteBFS(graph, req.StartVertex)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, BFSResponse{
		StartVertex:     req.StartVertex,
		VisitedVertices: visitedVertices,
	})
}

func (h *NoCostGraphHandler) ExecuteIsBinaryTree(c echo.Context) error {
	var req NoCostGraphNeighborListRequest

	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	graph, err := h.noCostGraphUseCase.MakeNewNoCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if graph == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Graph not found"})
	}

	isBinaryTree, groups1, groups2, err := h.noCostGraphUseCase.ExecuteIsBinaryTree(graph)
	if err != nil {
		if(err == errors.New("the graph is not an undirected graph")) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if(!isBinaryTree) {
		return c.JSON(http.StatusOK, IsBinaryTreeResponse{
			IsBinaryTree: false,
			GroupOne:     nil,
			GroupTwo:     nil,
		})
	}

	return c.JSON(http.StatusOK, IsBinaryTreeResponse{
		IsBinaryTree: isBinaryTree,
		GroupOne:     groups1,
		GroupTwo:     groups2,
	})
}
