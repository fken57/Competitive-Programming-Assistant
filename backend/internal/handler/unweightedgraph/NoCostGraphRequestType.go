package handler

type NoCostGraphRequest struct {
	VertexCount int      `json:"vertex_count"`
	Edges       [][2]int `json:"edges"`
}

type NoCostGraphNeighborListRequest struct {
	VertexCount int     `json:"vertex_count"`
	Neighbors   [][]int `json:"neighbors"`
	StartVertex int     `json:"start_vertex"`
}

type BFSResponse struct {
	StartVertex     int   `json:"start_vertex"`
	VisitedVertices []int `json:"visited_vertices"`
}
