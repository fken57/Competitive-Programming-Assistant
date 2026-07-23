package array

func BuildPrefixSum(values []int64) []int64 {
	prefixSum := make([]int64, len(values)+1)
	for index, value := range values {
		prefixSum[index+1] = prefixSum[index] + value
	}
	return prefixSum
}
