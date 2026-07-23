package array

import "sort"

type CompressionResult struct {
	CompressedValues []int
	DistinctValues   []int64
}

func CompressValues(values []int64) CompressionResult {
	distinctValues := append([]int64(nil), values...)
	sort.Slice(distinctValues, func(left, right int) bool {
		return distinctValues[left] < distinctValues[right]
	})

	writeIndex := 0
	for _, value := range distinctValues {
		if writeIndex == 0 || distinctValues[writeIndex-1] != value {
			distinctValues[writeIndex] = value
			writeIndex++
		}
	}
	distinctValues = distinctValues[:writeIndex]

	compressedValues := make([]int, len(values))
	for index, value := range values {
		compressedValues[index] = sort.Search(len(distinctValues), func(position int) bool {
			return distinctValues[position] >= value
		})
	}

	return CompressionResult{
		CompressedValues: compressedValues,
		DistinctValues:   distinctValues,
	}
}
