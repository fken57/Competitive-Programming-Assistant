package array

import "sort"

// CountPairsSumAtMostKAfterSort counts index pairs whose sum is at most target.
// It sorts a copy so that the input slice remains unchanged.
func CountPairsSumAtMostKAfterSort(values []int64, target int64) int64 {
	sortedValues := append([]int64(nil), values...)
	sort.Slice(sortedValues, func(i, j int) bool { return sortedValues[i] < sortedValues[j] })

	left, right := 0, len(sortedValues)-1
	var count int64
	for left < right {
		if sortedValues[left]+sortedValues[right] <= target {
			count += int64(right - left)
			left++
		} else {
			right--
		}
	}

	return count
}
