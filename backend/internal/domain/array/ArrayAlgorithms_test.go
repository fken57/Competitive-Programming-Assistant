package array

import (
	"reflect"
	"testing"
)

func TestBuildPrefixSum(t *testing.T) {
	values := []int64{3, -1, 4, -2}
	got := BuildPrefixSum(values)
	want := []int64{0, 3, 2, 6, 4}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("BuildPrefixSum() = %v, want %v", got, want)
	}
	if !reflect.DeepEqual(values, []int64{3, -1, 4, -2}) {
		t.Fatalf("BuildPrefixSum changed its input: %v", values)
	}
}

func TestCompressValuesUsesZeroBasedSortedRanks(t *testing.T) {
	got := CompressValues([]int64{50, -3, 50, 10})
	if want := []int{2, 0, 2, 1}; !reflect.DeepEqual(got.CompressedValues, want) {
		t.Fatalf("CompressedValues = %v, want %v", got.CompressedValues, want)
	}
	if want := []int64{-3, 10, 50}; !reflect.DeepEqual(got.DistinctValues, want) {
		t.Fatalf("DistinctValues = %v, want %v", got.DistinctValues, want)
	}
}

func TestCountInversions(t *testing.T) {
	tests := []struct {
		name   string
		values []int64
		want   int64
	}{
		{name: "mixed", values: []int64{3, 1, 2, 1}, want: 4},
		{name: "equal values are not inversions", values: []int64{2, 2, 2}, want: 0},
		{name: "descending", values: []int64{5, 4, 3, 2, 1}, want: 10},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := CountInversions(test.values); got != test.want {
				t.Fatalf("CountInversions(%v) = %d, want %d", test.values, got, test.want)
			}
		})
	}
}

func TestCountInversionsUsesInt64ForLargeResults(t *testing.T) {
	const size = 100_000
	values := make([]int64, size)
	for index := range values {
		values[index] = int64(size - index)
	}
	want := int64(size) * int64(size-1) / 2
	if got := CountInversions(values); got != want {
		t.Fatalf("CountInversions(descending %d values) = %d, want %d", size, got, want)
	}
}

func TestStaticMexIgnoresNegativeValuesAndDuplicates(t *testing.T) {
	if got := StaticMex([]int64{-2, 0, 1, 1, 3}); got != 2 {
		t.Fatalf("StaticMex() = %d, want 2", got)
	}
}

func TestRunLengthEncodingOnlyCombinesConsecutiveValues(t *testing.T) {
	got := RunLengthEncoding([]int64{1, 1, 2, 1, 1, 1})
	want := []Run{{Value: 1, Count: 2}, {Value: 2, Count: 1}, {Value: 1, Count: 3}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("RunLengthEncoding() = %v, want %v", got, want)
	}
}

func dereference(values []*int64) []any {
	result := make([]any, len(values))
	for index, value := range values {
		if value != nil {
			result[index] = *value
		}
	}
	return result
}

func TestNextGreaterToRightStrictReturnsNearestMatch(t *testing.T) {
	got := NextGreaterToRightStrict([]int64{2, 2, 3, 1, 4})
	if want := []int{2, 2, 4, 4, -1}; !reflect.DeepEqual(got.Indices, want) {
		t.Fatalf("Indices = %v, want %v", got.Indices, want)
	}
	if want := []any{int64(3), int64(3), int64(4), int64(4), nil}; !reflect.DeepEqual(dereference(got.Values), want) {
		t.Fatalf("Values = %v, want %v", dereference(got.Values), want)
	}
}

func TestNextSmallerToRightStrictReturnsNearestMatch(t *testing.T) {
	got := NextSmallerToRightStrict([]int64{3, 3, 1, 2, 0})
	if want := []int{2, 2, 4, 4, -1}; !reflect.DeepEqual(got.Indices, want) {
		t.Fatalf("Indices = %v, want %v", got.Indices, want)
	}
	if want := []any{int64(1), int64(1), int64(0), int64(0), nil}; !reflect.DeepEqual(dereference(got.Values), want) {
		t.Fatalf("Values = %v, want %v", dereference(got.Values), want)
	}
}

func TestLongestDistinctSubarrayUsesLeftmostTie(t *testing.T) {
	got := LongestDistinctSubarray([]int64{1, 2, 1, 3, 2, 3})
	want := DistinctSubarrayResult{
		Length:         3,
		Left:           1,
		RightExclusive: 4,
		Values:         []int64{2, 1, 3},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("LongestDistinctSubarray() = %#v, want %#v", got, want)
	}

	tied := LongestDistinctSubarray([]int64{1, 2, 1, 2})
	if tied.Left != 0 || tied.RightExclusive != 2 {
		t.Fatalf("leftmost tie = [%d, %d), want [0, 2)", tied.Left, tied.RightExclusive)
	}
}

func TestAlgorithmsHandleSingleElement(t *testing.T) {
	values := []int64{7}
	if got := BuildPrefixSum(values); !reflect.DeepEqual(got, []int64{0, 7}) {
		t.Fatalf("prefix sum = %v", got)
	}
	if got := CountInversions(values); got != 0 {
		t.Fatalf("inversion count = %d", got)
	}
	if got := LongestDistinctSubarray(values); got.Length != 1 || got.Left != 0 || got.RightExclusive != 1 {
		t.Fatalf("longest distinct = %#v", got)
	}
}
