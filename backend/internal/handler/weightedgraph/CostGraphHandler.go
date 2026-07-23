package handler

import (
	graphusecase "backend/internal/usecase/weightedgraph"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

type CostGraphHandler struct {
	costGraphUseCase *graphusecase.CostGraphUseCase
}

func validateWeightedNeighborListRequest(req CostGraphNeighborListRequest) error {
	if req.VertexCount <= 0 {
		return fmt.Errorf("vertex_count must be positive")
	}
	if len(req.Neighbors) != req.VertexCount {
		return fmt.Errorf("neighbors length must match vertex_count")
	}
	for _, neighbors := range req.Neighbors {
		for _, edge := range neighbors {
			if edge.To < 0 || edge.To >= req.VertexCount {
				return fmt.Errorf("neighbor vertex %d is out of range", edge.To)
			}
		}
	}
	return nil
}

func validateDijkstraRequest(req CostGraphNeighborListRequest) error {
	if err := validateWeightedNeighborListRequest(req); err != nil {
		return err
	}
	for _, neighbors := range req.Neighbors {
		for _, edge := range neighbors {
			if edge.Weight < 0 {
				return fmt.Errorf("Dijkstra does not support negative edge weights")
			}
		}
	}
	return nil
}

func NewCostGraphHandler(usecase *graphusecase.CostGraphUseCase) *CostGraphHandler {
	return &CostGraphHandler{
		costGraphUseCase: usecase,
	}
}

func (h *CostGraphHandler) ExecuteDijkstra(c echo.Context) error {
	var req CostGraphNeighborListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	if err := validateDijkstraRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	graph, err := h.costGraphUseCase.MakeNewCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	dist, prev, err := h.costGraphUseCase.ExecuteDijkstra(graph, req.StartVertex)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, DijkstraResponse{
		StartVertex: req.StartVertex,
		Distances:   dist,
		Previous:    prev,
	})
}

func (h *CostGraphHandler) ExecutePrim(c echo.Context) error {
	var req CostGraphNeighborListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	if err := validateWeightedNeighborListRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	graph, err := h.costGraphUseCase.MakeNewCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	result, err := h.costGraphUseCase.ExecutePrim(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	edges := make([]MSTEdgeResponse, len(result.Edges))
	for index, edge := range result.Edges {
		edges[index] = MSTEdgeResponse{From: edge.From, To: edge.To, Weight: edge.Weight}
	}
	return c.JSON(http.StatusOK, PrimResponse{IsSpanning: result.IsSpanning, TotalWeight: result.TotalWeight, Edges: edges})
}

func (h *CostGraphHandler) GetTreeDiameter(c echo.Context) error {
	var req CostGraphNeighborListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	if err := validateWeightedNeighborListRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	graph, err := h.costGraphUseCase.MakeNewCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	result, err := h.costGraphUseCase.GetTreeDiameter(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, TreeDiameterResponse{Diameter: result.Diameter, Vertex1: result.Vertex1, Vertex2: result.Vertex2})
}
