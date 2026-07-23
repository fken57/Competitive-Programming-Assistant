package array

func CountInversions(values []int64) int64 {
	work := append([]int64(nil), values...)
	buffer := make([]int64, len(values))

	var countRange func(int, int) int64
	countRange = func(left, right int) int64 {
		if right-left <= 1 {
			return 0
		}

		middle := left + (right-left)/2
		count := countRange(left, middle) + countRange(middle, right)
		leftIndex, rightIndex := left, middle

		for writeIndex := left; writeIndex < right; writeIndex++ {
			if rightIndex >= right || leftIndex < middle && work[leftIndex] <= work[rightIndex] {
				buffer[writeIndex] = work[leftIndex]
				leftIndex++
			} else {
				buffer[writeIndex] = work[rightIndex]
				rightIndex++
				count += int64(middle - leftIndex)
			}
		}

		copy(work[left:right], buffer[left:right])
		return count
	}

	return countRange(0, len(values))
}
