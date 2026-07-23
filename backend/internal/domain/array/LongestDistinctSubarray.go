package array

type DistinctSubarrayResult struct {
	Length         int
	Left           int
	RightExclusive int
	Values         []int64
}

func LongestDistinctSubarray(values []int64) DistinctSubarrayResult {
	lastPosition := make(map[int64]int, len(values))
	bestLeft, bestRight, left := 0, 0, 0

	for right, value := range values {
		if previous, exists := lastPosition[value]; exists && previous >= left {
			left = previous + 1
		}
		lastPosition[value] = right
		if right+1-left > bestRight-bestLeft {
			bestLeft = left
			bestRight = right + 1
		}
	}

	return DistinctSubarrayResult{
		Length:         bestRight - bestLeft,
		Left:           bestLeft,
		RightExclusive: bestRight,
		Values:         append([]int64(nil), values[bestLeft:bestRight]...),
	}
}
