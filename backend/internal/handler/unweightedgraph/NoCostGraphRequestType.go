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
	IsBinaryTree bool  `json:"is_binary_tree"`
	GroupOne     []int `json:"group_one"`
	GroupTwo     []int `json:"group_two"`
	OddCycle     []int `json:"odd_cycle"`
}

type TreeDistanceResponse struct {
	TreeDir int `json:"tree_dir"`
	Vertex1 int `json:"vertex1"`
	Vertex2 int `json:"vertex2"`
}

type TopologicalSortResponse struct {
	Vertices []int `json:"vertices"`
}

type IsTreeResponse struct {
	IsTree bool `json:"is_tree"`
}

type SCCResponse struct {
	SCCs [][]int `json:"sccs"`
}

type DFSResponse struct {
	StartVertex int   `json:"start_vertex"`
	PreOrder    []int `json:"pre_order"`
	PostOrder   []int `json:"post_order"`
}

type ConnectedComponentsResponse struct {
	Components [][]int `json:"components"`
}

type DirectedCycleResponse struct {
	HasCycle bool  `json:"has_cycle"`
	Cycle    []int `json:"cycle"`
}

type UnionFindResponse struct {
	Parents    []int   `json:"parents"`
	Components [][]int `json:"components"`
}

type LowLinkBridgeResponse struct {
	From int `json:"from"`
	To   int `json:"to"`
}

type LowLinkResponse struct {
	ArticulationPoints []int                   `json:"articulation_points"`
	Bridges            []LowLinkBridgeResponse `json:"bridges"`
}

type LCARequest struct {
	VertexCount int      `json:"vertex_count"`
	Neighbors   [][]int  `json:"neighbors"`
	Root        int      `json:"root"`
	Queries     [][2]int `json:"queries"`
}

type LCAResponse struct {
	Root int   `json:"root"`
	LCAs []int `json:"lcas"`
}
