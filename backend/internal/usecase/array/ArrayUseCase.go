package arrayusecase

import (
	arraydomain "backend/internal/domain/array"
	"errors"
	"fmt"
)

const (
	MaxArrayLength = 200_000
	MinArrayValue  = int64(-1_000_000_000)
	MaxArrayValue  = int64(1_000_000_000)
)

type ArrayUseCase struct{}

func NewArrayUseCase() *ArrayUseCase {
	return &ArrayUseCase{}
}

func (useCase *ArrayUseCase) ValidateValues(values []int64) error {
	if len(values) == 0 {
		return errors.New("values must contain at least one element")
	}
	if len(values) > MaxArrayLength {
		return fmt.Errorf("values must contain at most %d elements", MaxArrayLength)
	}
	for index, value := range values {
		if value < MinArrayValue || value > MaxArrayValue {
			return fmt.Errorf("values[%d] must be between %d and %d", index, MinArrayValue, MaxArrayValue)
		}
	}
	return nil
}

func (useCase *ArrayUseCase) BuildPrefixSum(values []int64) []int64 {
	return arraydomain.BuildPrefixSum(values)
}

func (useCase *ArrayUseCase) CompressValues(values []int64) arraydomain.CompressionResult {
	return arraydomain.CompressValues(values)
}

func (useCase *ArrayUseCase) CountInversions(values []int64) int64 {
	return arraydomain.CountInversions(values)
}

func (useCase *ArrayUseCase) StaticMex(values []int64) int {
	return arraydomain.StaticMex(values)
}

func (useCase *ArrayUseCase) RunLengthEncoding(values []int64) []arraydomain.Run {
	return arraydomain.RunLengthEncoding(values)
}

func (useCase *ArrayUseCase) NextGreaterToRightStrict(values []int64) arraydomain.NextRightResult {
	return arraydomain.NextGreaterToRightStrict(values)
}

func (useCase *ArrayUseCase) NextSmallerToRightStrict(values []int64) arraydomain.NextRightResult {
	return arraydomain.NextSmallerToRightStrict(values)
}

func (useCase *ArrayUseCase) LongestDistinctSubarray(values []int64) arraydomain.DistinctSubarrayResult {
	return arraydomain.LongestDistinctSubarray(values)
}
