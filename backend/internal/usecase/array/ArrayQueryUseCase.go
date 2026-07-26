package arrayusecase

import (
	arraydomain "backend/internal/domain/array"
	"errors"
	"fmt"
)

func (useCase *ArrayUseCase) ValidateStaticRange(arrayLength, left, rightExclusive int) error {
	if left < 0 || left >= arrayLength {
		return fmt.Errorf("left must be between 0 and %d", arrayLength-1)
	}
	if rightExclusive <= left || rightExclusive > arrayLength {
		return fmt.Errorf("right_exclusive must be greater than left and at most %d", arrayLength)
	}
	return nil
}

func (useCase *ArrayUseCase) ValidateModQuery(modulus, remainder int64) error {
	if modulus <= 0 {
		return errors.New("modulus must be greater than 0")
	}
	if remainder < 0 || remainder >= modulus {
		return fmt.Errorf("remainder must be between 0 and modulus - 1")
	}
	return nil
}

func (useCase *ArrayUseCase) ValidateWindowSize(arrayLength, windowSize int) error {
	if windowSize <= 0 || windowSize > arrayLength {
		return fmt.Errorf("window_size must be between 1 and %d", arrayLength)
	}
	return nil
}

func (useCase *ArrayUseCase) ValidateMaxDifference(maxDifference int64) error {
	if maxDifference < 0 {
		return errors.New("max_difference must be at least 0")
	}
	return nil
}

func (useCase *ArrayUseCase) StaticRangeSumQuery(values []int64, left, rightExclusive int) int64 {
	return arraydomain.StaticRangeSumQuery(values, left, rightExclusive)
}

func (useCase *ArrayUseCase) CountSubarraysSumEqualK(values []int64, target int64) int64 {
	return arraydomain.CountSubarraysSumEqualK(values, target)
}

func (useCase *ArrayUseCase) CountSubarraysSumModEqualR(values []int64, modulus, remainder int64) int64 {
	return arraydomain.CountSubarraysSumModEqualR(values, modulus, remainder)
}

func (useCase *ArrayUseCase) FixedWindowMinimum(values []int64, windowSize int) []int64 {
	return arraydomain.FixedWindowMinimum(values, windowSize)
}

func (useCase *ArrayUseCase) FixedWindowMaximum(values []int64, windowSize int) []int64 {
	return arraydomain.FixedWindowMaximum(values, windowSize)
}

func (useCase *ArrayUseCase) CountPairsSumAtMostKAfterSort(values []int64, target int64) int64 {
	return arraydomain.CountPairsSumAtMostKAfterSort(values, target)
}

func (useCase *ArrayUseCase) CountPairsAbsDiffAtMostKAfterSort(values []int64, maxDifference int64) int64 {
	return arraydomain.CountPairsAbsDiffAtMostKAfterSort(values, maxDifference)
}
