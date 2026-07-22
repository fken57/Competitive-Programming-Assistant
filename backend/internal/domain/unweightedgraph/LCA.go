package unweightedgraph

import "backend/internal/domain/unweightedgraph/graphdatabase"

type LCAQuery struct {
	Left  int
	Right int
}

// LowestCommonAncestors computes LCA values for a rooted tree using binary lifting.
func LowestCommonAncestors(graph graphdatabase.UnweightedGraph, root int, queries []LCAQuery) []int {
	n := graph.VertexSize()
	if n == 0 || root < 0 || root >= n {
		return nil
	}

	levels := 1
	for (1 << levels) <= n {
		levels++
	}
	up := make([][]int, levels)
	for level := range up {
		up[level] = make([]int, n)
	}
	depth := make([]int, n)
	parent := make([]int, n)
	for i := range parent {
		parent[i] = -1
	}

	stack := []int{root}
	parent[root] = root
	for len(stack) > 0 {
		vertex := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		for _, next := range graph.NeighborEdges(vertex) {
			if next == parent[vertex] || parent[next] != -1 {
				continue
			}
			parent[next] = vertex
			depth[next] = depth[vertex] + 1
			stack = append(stack, next)
		}
	}

	for vertex := 0; vertex < n; vertex++ {
		up[0][vertex] = parent[vertex]
	}
	for level := 1; level < levels; level++ {
		for vertex := 0; vertex < n; vertex++ {
			up[level][vertex] = up[level-1][up[level-1][vertex]]
		}
	}

	lca := func(left, right int) int {
		if depth[left] < depth[right] {
			left, right = right, left
		}
		difference := depth[left] - depth[right]
		for level := 0; difference > 0; level++ {
			if difference&1 == 1 {
				left = up[level][left]
			}
			difference >>= 1
		}
		if left == right {
			return left
		}
		for level := levels - 1; level >= 0; level-- {
			if up[level][left] != up[level][right] {
				left = up[level][left]
				right = up[level][right]
			}
		}
		return up[0][left]
	}

	results := make([]int, len(queries))
	for index, query := range queries {
		results[index] = lca(query.Left, query.Right)
	}
	return results
}
