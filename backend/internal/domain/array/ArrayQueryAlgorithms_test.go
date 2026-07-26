package array

import (
	"reflect"
	"testing"
)

func TestStaticRangeSumQueryUsesHalfOpenRange(t *testing.T) {
	values := []int64{5, -2, 7, 4}
	if got := StaticRangeSumQuery(values, 1, 3); got != 5 {
		t.Fatalf("StaticRangeSumQuery() = %d, want 5", got)
	}
	if !reflect.DeepEqual(values, []int64{5, -2, 7, 4}) {
		t.Fatalf("StaticRangeSumQuery changed its input: %v", values)
	}
}

func TestCountSubarrayQueriesHandleNegativeValues(t *testing.T) {
	values := []int64{1, -1, 1, -1}
	if got := CountSubarraysSumEqualK(values, 0); got != 4 {
		t.Fatalf("CountSubarraysSumEqualK() = %d, want 4", got)
	}

	modValues := []int64{-1, 2, -3, 4}
	if got, want := CountSubarraysSumModEqualR(modValues, 3, 2), bruteCountSubarraysMod(modValues, 3, 2); got != want {
		t.Fatalf("CountSubarraysSumModEqualR() = %d, want %d", got, want)
	}
}

func TestFixedWindowExtrema(t *testing.T) {
	values := []int64{4, 2, 2, 5, 1}
	if got, want := FixedWindowMinimum(values, 3), []int64{2, 2, 1}; !reflect.DeepEqual(got, want) {
		t.Fatalf("FixedWindowMinimum() = %v, want %v", got, want)
	}
	if got, want := FixedWindowMaximum(values, 3), []int64{4, 5, 5}; !reflect.DeepEqual(got, want) {
		t.Fatalf("FixedWindowMaximum() = %v, want %v", got, want)
	}
	if got := FixedWindowMinimum(values, len(values)); !reflect.DeepEqual(got, []int64{1}) {
		t.Fatalf("full-window minimum = %v, want [1]", got)
	}
}

func TestPairQueriesDoNotSortInputInPlace(t *testing.T) {
	values := []int64{3, 1, 4, 2, 2}
	original := append([]int64(nil), values...)
	if got := CountPairsSumAtMostKAfterSort(values, 5); got != 7 {
		t.Fatalf("CountPairsSumAtMostKAfterSort() = %d, want 7", got)
	}
	if !reflect.DeepEqual(values, original) {
		t.Fatalf("sum pair query changed its input: %v", values)
	}
	if got := CountPairsAbsDiffAtMostKAfterSort(values, 1); got != 6 {
		t.Fatalf("CountPairsAbsDiffAtMostKAfterSort() = %d, want 6", got)
	}
	if !reflect.DeepEqual(values, original) {
		t.Fatalf("difference pair query changed its input: %v", values)
	}
}

func TestQueryAlgorithmsMatchBruteForce(t *testing.T) {
	arrays := [][]int64{
		{-2, -1, 0, 1, 2},
		{2, 2, 2, 2},
		{5, -4, 3, -2, 1},
	}
	for _, values := range arrays {
		for target := int64(-4); target <= 5; target++ {
			if got, want := CountSubarraysSumEqualK(values, target), bruteCountSubarraysEqual(values, target); got != want {
				t.Fatalf("CountSubarraysSumEqualK(%v, %d) = %d, want %d", values, target, got, want)
			}
			if got, want := CountPairsSumAtMostKAfterSort(values, target), bruteCountPairsSum(values, target); got != want {
				t.Fatalf("CountPairsSumAtMostKAfterSort(%v, %d) = %d, want %d", values, target, got, want)
			}
		}
		for modulus := int64(1); modulus <= 5; modulus++ {
			for remainder := int64(0); remainder < modulus; remainder++ {
				if got, want := CountSubarraysSumModEqualR(values, modulus, remainder), bruteCountSubarraysMod(values, modulus, remainder); got != want {
					t.Fatalf("CountSubarraysSumModEqualR(%v, %d, %d) = %d, want %d", values, modulus, remainder, got, want)
				}
			}
		}
		for maxDifference := int64(0); maxDifference <= 5; maxDifference++ {
			if got, want := CountPairsAbsDiffAtMostKAfterSort(values, maxDifference), bruteCountPairsDifference(values, maxDifference); got != want {
				t.Fatalf("CountPairsAbsDiffAtMostKAfterSort(%v, %d) = %d, want %d", values, maxDifference, got, want)
			}
		}
	}
}

func TestQueryCountsUseInt64(t *testing.T) {
	const size = 100_000
	values := make([]int64, size)
	wantSubarrays := int64(size) * int64(size+1) / 2
	if got := CountSubarraysSumEqualK(values, 0); got != wantSubarrays {
		t.Fatalf("zero-sum count = %d, want %d", got, wantSubarrays)
	}
	wantPairs := int64(size) * int64(size-1) / 2
	if got := CountPairsAbsDiffAtMostKAfterSort(values, 0); got != wantPairs {
		t.Fatalf("equal pair count = %d, want %d", got, wantPairs)
	}
}

func bruteCountSubarraysEqual(values []int64, target int64) int64 {
	var count int64
	for left := range values {
		var sum int64
		for right := left; right < len(values); right++ {
			sum += values[right]
			if sum == target {
				count++
			}
		}
	}
	return count
}

func bruteCountSubarraysMod(values []int64, modulus, remainder int64) int64 {
	var count int64
	for left := range values {
		var sum int64
		for right := left; right < len(values); right++ {
			sum += values[right]
			if normalizeModulo(sum, modulus) == remainder {
				count++
			}
		}
	}
	return count
}

func bruteCountPairsSum(values []int64, target int64) int64 {
	var count int64
	for left := range values {
		for right := left + 1; right < len(values); right++ {
			if values[left]+values[right] <= target {
				count++
			}
		}
	}
	return count
}

func bruteCountPairsDifference(values []int64, maxDifference int64) int64 {
	var count int64
	for left := range values {
		for right := left + 1; right < len(values); right++ {
			difference := values[left] - values[right]
			if difference < 0 {
				difference = -difference
			}
			if difference <= maxDifference {
				count++
			}
		}
	}
	return count
}
