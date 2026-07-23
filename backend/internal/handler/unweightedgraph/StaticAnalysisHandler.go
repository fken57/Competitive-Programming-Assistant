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

func (h *NoCostGraphHandler) AnalyzeUnorderedStatic(c echo.Context) error {
	var req NoCostGraphNeighborListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	if err := validateNoCostNeighborListRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	graph, err := h.noCostGraphUseCase.MakeNewNoCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	components, err := h.noCostGraphUseCase.GetConnectedComponents(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	unionFind, err := h.noCostGraphUseCase.ExecuteUnionFind(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	lowLink, err := h.noCostGraphUseCase.GetLowLink(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	bridges := make([]LowLinkBridgeResponse, len(lowLink.Bridges))
	for index, bridge := range lowLink.Bridges {
		bridges[index] = LowLinkBridgeResponse{From: bridge.From, To: bridge.To}
	}
	isBinary, groupOne, groupTwo, oddCycle, err := h.noCostGraphUseCase.ExecuteIsBinaryTree(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	treeAnalysis, err := h.noCostGraphUseCase.ExecuteIsTree(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	results := []StaticAnalysisItem{
		{ID: "connected_components", Status: "success", Data: ConnectedComponentsResponse{Components: components}},
		{ID: "union_find", Status: "success", Data: UnionFindResponse{Parents: unionFind.Parents, Components: unionFind.Components}},
		{ID: "low_link", Status: "success", Data: LowLinkResponse{ArticulationPoints: lowLink.ArticulationPoints, Bridges: bridges}},
		{ID: "is_binary_tree", Status: "success", Data: IsBinaryTreeResponse{IsBinaryTree: isBinary, GroupOne: groupOne, GroupTwo: groupTwo, OddCycle: oddCycle}},
		{ID: "is_tree", Status: "success", Data: IsTreeResponse{IsTree: treeAnalysis.IsTree, Cycle: treeAnalysis.Cycle, Components: treeAnalysis.Components}},
	}
	if treeAnalysis.IsTree {
		distance, distanceErr := h.noCostGraphUseCase.GetTreeDistance(graph)
		if distanceErr != nil {
			results = append(results, StaticAnalysisItem{ID: "tree_distance", Status: "error", Reason: distanceErr.Error()})
		} else {
			results = append(results, StaticAnalysisItem{ID: "tree_distance", Status: "success", Data: TreeDistanceResponse{
				TreeDir: distance.TreeDir, Vertex1: distance.Vertex1, Vertex2: distance.Vertex2,
			}})
		}
	} else {
		results = append(results, StaticAnalysisItem{ID: "tree_distance", Status: "skipped", Reason: "graph is not a tree"})
	}

	return c.JSON(http.StatusOK, StaticAnalysisResponse{Results: results})
}

func (h *NoCostGraphHandler) AnalyzeOrderedStatic(c echo.Context) error {
	var req NoCostGraphNeighborListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}
	if err := validateNoCostNeighborListRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	graph, err := h.noCostGraphUseCase.MakeNewNoCostNeighborListGraph(req.VertexCount, req.Neighbors)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	cycle, err := h.noCostGraphUseCase.DetectDirectedCycle(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	topologicalSort, err := h.noCostGraphUseCase.TopologicalSort(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	sccs, err := h.noCostGraphUseCase.ExecuteSCC(graph)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, StaticAnalysisResponse{Results: []StaticAnalysisItem{
		{ID: "directed_cycle", Status: "success", Data: DirectedCycleResponse{HasCycle: len(cycle) > 0, Cycle: cycle}},
		{ID: "topological_sort", Status: "success", Data: TopologicalSortResponse{
			Sortable: topologicalSort.Sortable, Vertices: topologicalSort.Vertices, Cycle: topologicalSort.Cycle,
		}},
		{ID: "scc", Status: "success", Data: SCCResponse{SCCs: sccs}},
	}})
}
