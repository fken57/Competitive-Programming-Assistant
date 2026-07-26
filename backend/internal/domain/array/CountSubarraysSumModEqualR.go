package array

func normalizeModulo(value, modulus int64) int64 {
	remainder := value % modulus
	if remainder < 0 {
		remainder += modulus
	}
	return remainder
}

// CountSubarraysSumModEqualR counts contiguous subarrays whose sum modulo modulus equals remainder.
func CountSubarraysSumModEqualR(values []int64, modulus, remainder int64) int64 {
	prefixFrequencies := map[int64]int64{0: 1}
	var prefixSum int64
	var count int64

	for _, value := range values {
		prefixSum += value
		currentRemainder := normalizeModulo(prefixSum, modulus)
		requiredPrefix := normalizeModulo(currentRemainder-remainder, modulus)
		count += prefixFrequencies[requiredPrefix]
		prefixFrequencies[currentRemainder]++
	}

	return count
}
