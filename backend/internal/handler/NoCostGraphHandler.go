package handler

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"

	"backend/internal/usecase/graph"
)

type NoCostGraphHandler struct {
	noCostGraphUseCase *graph.NoCostGraphUseCase
}

type GraphResponse struct {
	VertexSize int     `json:"vertex_size"`
	Edges      [][]int `json:"edges"`
}

func NewNoCostGraphHandler(noCostGraphUseCase *graph.NoCostGraphUseCase) *NoCostGraphHandler {
	return &NoCostGraphHandler{
		noCostGraphUseCase: noCostGraphUseCase,
	}
}

func (h *NoCostGraphHandler) MakeNewNoCostUnorderedGraph(c echo.Context) error {
	var req NoCostGraphRequest

	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	
	for i := 0; i < len(req.Edges); i++ {
		for j := 0; j < len(req.Edges[i]); j++ {
			req.Edges[i][j]--
		}
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
	// Implementation for creating a new ordered no-cost graph
	return nil
}
