package handler

type NoCostGraphRequest struct {
	VertexCount  int `json:"vertex_count"`
	Edges [][2]int `json:"edges"`
}

type BFSResponse struct{
	StartVertex int `json:"start_vertex"`
	VisitedVertices []int `json:"visited_vertices"`
}

