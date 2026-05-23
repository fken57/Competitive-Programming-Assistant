package functionalgraph

import (
	functionalgraph "backend/internal/domain/functionalgraph/functionalgraphdatabase"
)

type DoublingResult struct {
	doubling [][]int
	maxSteps int
}

// @brief functional graphのダブリングをする
func FunctionalGraphDoubling(fg *functionalgraph.FunctionalGraph) *DoublingResult {
	doublingSize := 60
	doublingResult := &DoublingResult{
		doubling: make([][]int, doublingSize),
		maxSteps: doublingSize - 1,
	}

	for i := range doublingResult.doubling {
		doublingResult.doubling[i] = make([]int, fg.NodeSize)
	}

	for i := range doublingResult.doubling {
		doublingResult.doubling[0][i] = fg.Edges[i]
	}

	for i := 1; i < doublingSize; i++ {
		for j := 0; j < fg.NodeSize; j++ {
			doublingResult.doubling[i][j] = doublingResult.doubling[i-1][doublingResult.doubling[i-1][j]]
		}
	}

	return doublingResult
}

func FunctionalGraphDoublingCalc(doublingResult *DoublingResult, start int, steps int) int {
	if steps == 0 {
		return start
	}

	if steps > (1 << doublingResult.maxSteps) {
		panic("Steps exceed maximum allowed")
	}
	for i := 0; i < doublingResult.maxSteps && steps > 0; i++ {
		if steps&1 != 0 {
			start = doublingResult.doubling[i][start]
		}
		steps >>= 1
	}
	return start
}
