package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type StaticAnalysisItem struct {
	ID     string      `json:"id"`
	Status string      `json:"status"`
	Data   interface{} `json:"data,omitempty"`
	Reason string      `json:"reason,omitempty"`
}

type StaticAnalysisResponse struct {
	Results []StaticAnalysisItem `json:"results"`
}

func (h *CostGraphHandler) AnalyzeUnorderedStatic(c echo.Context) error {
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

	prim, err := h.costGraphUseCase.ExecutePrim(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	edges := make([]MSTEdgeResponse, len(prim.Edges))
	for index, edge := range prim.Edges {
		edges[index] = MSTEdgeResponse{From: edge.From, To: edge.To, Weight: edge.Weight}
	}
	results := []StaticAnalysisItem{{
		ID: "prim", Status: "success",
		Data: PrimResponse{IsSpanning: prim.IsSpanning, TotalWeight: prim.TotalWeight, Edges: edges},
	}}

	diameter, diameterErr := h.costGraphUseCase.GetTreeDiameter(graph)
	if diameterErr != nil {
		results = append(results, StaticAnalysisItem{ID: "tree_diameter", Status: "skipped", Reason: diameterErr.Error()})
	} else {
		results = append(results, StaticAnalysisItem{
			ID: "tree_diameter", Status: "success",
			Data: TreeDiameterResponse{Diameter: diameter.Diameter, Vertex1: diameter.Vertex1, Vertex2: diameter.Vertex2},
		})
	}
	return c.JSON(http.StatusOK, StaticAnalysisResponse{Results: results})
}
