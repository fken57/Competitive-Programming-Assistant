package array

import "sort"

// CountPairsAbsDiffAtMostKAfterSort counts index pairs whose absolute difference is at most maxDifference.
// It sorts a copy so that the input slice remains unchanged.
func CountPairsAbsDiffAtMostKAfterSort(values []int64, maxDifference int64) int64 {
	sortedValues := append([]int64(nil), values...)
	sort.Slice(sortedValues, func(i, j int) bool { return sortedValues[i] < sortedValues[j] })

	left := 0
	var count int64
	for right := range sortedValues {
		for sortedValues[right]-sortedValues[left] > maxDifference {
			left++
		}
		count += int64(right - left)
	}

	return count
}
