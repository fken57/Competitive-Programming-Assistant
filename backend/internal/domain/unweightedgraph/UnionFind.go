package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

type UnionFindResult struct {
	Parents    []int
	Components [][]int
}

type unionFind struct {
	parent []int
	size   []int
}

func newUnionFind(size int) *unionFind {
	parent := make([]int, size)
	componentSize := make([]int, size)
	for i := range parent {
		parent[i] = i
		componentSize[i] = 1
	}
	return &unionFind{parent: parent, size: componentSize}
}

func (u *unionFind) find(vertex int) int {
	if u.parent[vertex] != vertex {
		u.parent[vertex] = u.find(u.parent[vertex])
	}
	return u.parent[vertex]
}

func (u *unionFind) union(left, right int) {
	leftRoot := u.find(left)
	rightRoot := u.find(right)
	if leftRoot == rightRoot {
		return
	}
	if u.size[leftRoot] < u.size[rightRoot] {
		leftRoot, rightRoot = rightRoot, leftRoot
	}
	u.parent[rightRoot] = leftRoot
	u.size[leftRoot] += u.size[rightRoot]
}

// UnionFindComponents unions every input edge and returns the final groups.
func UnionFindComponents(graph graphdatabase.UnweightedGraph) UnionFindResult {
	uf := newUnionFind(graph.VertexSize())
	for vertex := 0; vertex < graph.VertexSize(); vertex++ {
		for _, next := range graph.NeighborEdges(vertex) {
			uf.union(vertex, next)
		}
	}

	groups := make(map[int][]int)
	parents := make([]int, graph.VertexSize())
	for vertex := 0; vertex < graph.VertexSize(); vertex++ {
		root := uf.find(vertex)
		parents[vertex] = root
		groups[root] = append(groups[root], vertex)
	}

	components := make([][]int, 0, len(groups))
	for vertex := 0; vertex < graph.VertexSize(); vertex++ {
		if group, ok := groups[vertex]; ok {
			components = append(components, group)
		}
	}

	return UnionFindResult{Parents: parents, Components: components}
}
