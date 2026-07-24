package randomgen

import (
	"errors"
	"strconv"
)

type SplitMix64 struct {
	state uint64
}

func NewSplitMix64(seed string) (*SplitMix64, error) {
	value, err := strconv.ParseUint(seed, 10, 64)
	if err != nil {
		return nil, errors.New("seed must be an unsigned 64-bit integer")
	}
	return &SplitMix64{state: value}, nil
}

func (rng *SplitMix64) Next() uint64 {
	rng.state += 0x9e3779b97f4a7c15
	value := rng.state
	value = (value ^ (value >> 30)) * 0xbf58476d1ce4e5b9
	value = (value ^ (value >> 27)) * 0x94d049bb133111eb
	return value ^ (value >> 31)
}

func (rng *SplitMix64) Intn(limit int) int {
	if limit <= 0 {
		panic("randomgen: Intn limit must be positive")
	}
	bound := uint64(limit)
	threshold := -bound % bound
	for {
		value := rng.Next()
		if value >= threshold {
			return int(value % bound)
		}
	}
}

func (rng *SplitMix64) IntRange(minValue, maxValue int) int {
	return minValue + rng.Intn(maxValue-minValue+1)
}

func (rng *SplitMix64) Shuffle(length int, swap func(i, j int)) {
	for index := length - 1; index > 0; index-- {
		swap(index, rng.Intn(index+1))
	}
}
