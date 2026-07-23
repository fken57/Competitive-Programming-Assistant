package array

func NextSmallerToRightStrict(values []int64) NextRightResult {
	indices := make([]int, len(values))
	nextValues := make([]*int64, len(values))
	stack := make([]int, 0, len(values))

	for index := len(values) - 1; index >= 0; index-- {
		for len(stack) > 0 && values[stack[len(stack)-1]] >= values[index] {
			stack = stack[:len(stack)-1]
		}
		indices[index] = -1
		if len(stack) > 0 {
			nextIndex := stack[len(stack)-1]
			nextValue := values[nextIndex]
			indices[index] = nextIndex
			nextValues[index] = &nextValue
		}
		stack = append(stack, index)
	}

	return NextRightResult{Indices: indices, Values: nextValues}
}
