package array

// FixedWindowMaximum returns the maximum value for every window of windowSize.
func FixedWindowMaximum(values []int64, windowSize int) []int64 {
	if windowSize <= 0 || windowSize > len(values) {
		return []int64{}
	}

	deque := make([]int, 0, len(values))
	head := 0
	maximums := make([]int64, 0, len(values)-windowSize+1)

	for index, value := range values {
		for head < len(deque) && deque[head] <= index-windowSize {
			head++
		}
		for len(deque) > head && values[deque[len(deque)-1]] <= value {
			deque = deque[:len(deque)-1]
		}
		deque = append(deque, index)
		if index >= windowSize-1 {
			maximums = append(maximums, values[deque[head]])
		}
	}

	return maximums
}
