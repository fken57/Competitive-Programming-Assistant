package array

// StaticRangeSumQuery returns the sum of values in the half-open range [left, rightExclusive).
func StaticRangeSumQuery(values []int64, left, rightExclusive int) int64 {
	prefixSum := BuildPrefixSum(values)
	return prefixSum[rightExclusive] - prefixSum[left]
}
