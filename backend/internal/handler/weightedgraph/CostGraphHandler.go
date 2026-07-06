package handler

import (
	graphusecase "backend/internal/usecase/weightedgraph"
	"net/http"

	"github.com/labstack/echo/v4"
)

type CostGraphHandler struct {
	costGraphUseCase *graphusecase.CostGraphUseCase
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
