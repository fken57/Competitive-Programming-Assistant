package graph

type GraphRepository interface {
	GetVertices() []int
	GetNeighbors(vertex int) []int
}