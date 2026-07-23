package arrayusecase

import (
	"strings"
	"testing"
)

func TestValidateValues(t *testing.T) {
	useCase := NewArrayUseCase()

	tests := []struct {
		name    string
		values  []int64
		wantErr string
	}{
		{name: "minimum valid input", values: []int64{MinArrayValue}},
		{name: "maximum valid value", values: []int64{MaxArrayValue}},
		{name: "empty input", values: []int64{}, wantErr: "at least one"},
		{name: "value too small", values: []int64{MinArrayValue - 1}, wantErr: "values[0]"},
		{name: "value too large", values: []int64{MaxArrayValue + 1}, wantErr: "values[0]"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := useCase.ValidateValues(test.values)
			if test.wantErr == "" && err != nil {
				t.Fatalf("ValidateValues() error = %v", err)
			}
			if test.wantErr != "" && (err == nil || !strings.Contains(err.Error(), test.wantErr)) {
				t.Fatalf("ValidateValues() error = %v, want containing %q", err, test.wantErr)
			}
		})
	}
}

func TestValidateValuesRejectsTooManyElements(t *testing.T) {
	values := make([]int64, MaxArrayLength+1)
	err := NewArrayUseCase().ValidateValues(values)
	if err == nil || !strings.Contains(err.Error(), "at most 200000") {
		t.Fatalf("ValidateValues() error = %v", err)
	}
}
