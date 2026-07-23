package array

type Run struct {
	Value int64
	Count int
}

func RunLengthEncoding(values []int64) []Run {
	if len(values) == 0 {
		return []Run{}
	}

	runs := []Run{{Value: values[0], Count: 1}}
	for _, value := range values[1:] {
		last := &runs[len(runs)-1]
		if last.Value == value {
			last.Count++
		} else {
			runs = append(runs, Run{Value: value, Count: 1})
		}
	}
	return runs
}
