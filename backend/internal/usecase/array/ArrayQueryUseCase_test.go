package arrayusecase

import (
	"strings"
	"testing"
)

func TestValidateStaticRange(t *testing.T) {
	useCase := NewArrayUseCase()
	tests := []struct {
		name               string
		arrayLength        int
		left               int
		rightExclusive     int
		wantErrorSubstring string
	}{
		{name: "valid entire range", arrayLength: 3, left: 0, rightExclusive: 3},
		{name: "valid suffix", arrayLength: 3, left: 2, rightExclusive: 3},
		{name: "negative left", arrayLength: 3, left: -1, rightExclusive: 2, wantErrorSubstring: "left"},
		{name: "left at length", arrayLength: 3, left: 3, rightExclusive: 3, wantErrorSubstring: "left"},
		{name: "empty range", arrayLength: 3, left: 1, rightExclusive: 1, wantErrorSubstring: "right_exclusive"},
		{name: "right past length", arrayLength: 3, left: 1, rightExclusive: 4, wantErrorSubstring: "right_exclusive"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := useCase.ValidateStaticRange(test.arrayLength, test.left, test.rightExclusive)
			if test.wantErrorSubstring == "" && err != nil {
				t.Fatalf("ValidateStaticRange() error = %v", err)
			}
			if test.wantErrorSubstring != "" && (err == nil || !strings.Contains(err.Error(), test.wantErrorSubstring)) {
				t.Fatalf("ValidateStaticRange() error = %v, want containing %q", err, test.wantErrorSubstring)
			}
		})
	}
}

func TestValidateArrayQueryParameters(t *testing.T) {
	useCase := NewArrayUseCase()
	if err := useCase.ValidateModQuery(3, 2); err != nil {
		t.Fatalf("valid mod query rejected: %v", err)
	}
	for _, parameters := range [][2]int64{{0, 0}, {-1, 0}, {3, -1}, {3, 3}} {
		if err := useCase.ValidateModQuery(parameters[0], parameters[1]); err == nil {
			t.Fatalf("ValidateModQuery(%d, %d) accepted invalid parameters", parameters[0], parameters[1])
		}
	}

	for _, windowSize := range []int{0, -1, 4} {
		if err := useCase.ValidateWindowSize(3, windowSize); err == nil {
			t.Fatalf("ValidateWindowSize(3, %d) accepted invalid window", windowSize)
		}
	}
	if err := useCase.ValidateWindowSize(3, 3); err != nil {
		t.Fatalf("valid window rejected: %v", err)
	}
	if err := useCase.ValidateMaxDifference(-1); err == nil {
		t.Fatal("negative max difference was accepted")
	}
	if err := useCase.ValidateMaxDifference(0); err != nil {
		t.Fatalf("zero max difference rejected: %v", err)
	}
}
