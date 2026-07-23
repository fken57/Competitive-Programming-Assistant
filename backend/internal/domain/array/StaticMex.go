package array

func StaticMex(values []int64) int {
	present := make([]bool, len(values)+1)
	for _, value := range values {
		if value >= 0 && value <= int64(len(values)) {
			present[int(value)] = true
		}
	}
	for value, exists := range present {
		if !exists {
			return value
		}
	}
	return len(values) + 1
}
