package array

// CountSubarraysSumEqualK counts contiguous subarrays whose sum equals target.
func CountSubarraysSumEqualK(values []int64, target int64) int64 {
	prefixFrequencies := map[int64]int64{0: 1}
	var prefixSum int64
	var count int64

	for _, value := range values {
		prefixSum += value
		count += prefixFrequencies[prefixSum-target]
		prefixFrequencies[prefixSum]++
	}

	return count
}
