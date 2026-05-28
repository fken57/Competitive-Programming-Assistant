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

type IsBinaryTreeResponse struct {
	IsBinaryTree bool `json:"is_binary_tree"`
	GroupOne []int `json:"group_one"`
	GroupTwo []int `json:"group_two"`
}

type TreeDistanceResponse struct {
	TreeDir int `json:"tree_dir"`
	Vertex1 int `json:"vertex1"`
	Vertex2 int `json:"vertex2"`
}