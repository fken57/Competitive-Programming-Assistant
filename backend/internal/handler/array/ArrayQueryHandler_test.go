package handler

import (
	arrayusecase "backend/internal/usecase/array"
	"net/http"
	"reflect"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestArrayQueryHandlersReturnExpectedResults(t *testing.T) {
	handler := NewArrayHandler(arrayusecase.NewArrayUseCase())
	tests := []struct {
		name       string
		handle     echo.HandlerFunc
		body       string
		resultKey  string
		wantResult any
	}{
		{name: "static range sum", handle: handler.StaticRangeSumQuery, body: `{"values":[3,-1,4],"left":1,"right_exclusive":3}`, resultKey: "sum", wantResult: float64(3)},
		{name: "subarray exact sum", handle: handler.CountSubarraysSumEqualK, body: `{"values":[1,-1,1],"target":1}`, resultKey: "count", wantResult: float64(3)},
		{name: "subarray modulo", handle: handler.CountSubarraysSumModEqualR, body: `{"values":[1,2,3],"modulus":3,"remainder":0}`, resultKey: "count", wantResult: float64(3)},
		{name: "window minimum", handle: handler.FixedWindowMinimum, body: `{"values":[4,2,5,1],"window_size":2}`, resultKey: "minimums", wantResult: []any{float64(2), float64(2), float64(1)}},
		{name: "window maximum", handle: handler.FixedWindowMaximum, body: `{"values":[4,2,5,1],"window_size":2}`, resultKey: "maximums", wantResult: []any{float64(4), float64(5), float64(5)}},
		{name: "pair sum", handle: handler.CountPairsSumAtMostKAfterSort, body: `{"values":[3,1,4,2],"target":5}`, resultKey: "count", wantResult: float64(4)},
		{name: "pair difference", handle: handler.CountPairsAbsDiffAtMostKAfterSort, body: `{"values":[1,4,2,3],"max_difference":2}`, resultKey: "count", wantResult: float64(5)},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder, response := executeRequest(t, test.handle, test.body)
			if recorder.Code != http.StatusOK {
				t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
			}
			if got := response[test.resultKey]; !reflect.DeepEqual(got, test.wantResult) {
				t.Fatalf("%s = %#v, want %#v", test.resultKey, got, test.wantResult)
			}
		})
	}
}

func TestArrayQueryHandlersRejectInvalidParameters(t *testing.T) {
	handler := NewArrayHandler(arrayusecase.NewArrayUseCase())
	tests := []struct {
		name   string
		handle echo.HandlerFunc
		body   string
	}{
		{name: "missing range", handle: handler.StaticRangeSumQuery, body: `{"values":[1,2,3]}`},
		{name: "range past end", handle: handler.StaticRangeSumQuery, body: `{"values":[1,2,3],"left":0,"right_exclusive":4}`},
		{name: "missing target", handle: handler.CountSubarraysSumEqualK, body: `{"values":[1,2,3]}`},
		{name: "non-positive modulus", handle: handler.CountSubarraysSumModEqualR, body: `{"values":[1],"modulus":0,"remainder":0}`},
		{name: "non-canonical remainder", handle: handler.CountSubarraysSumModEqualR, body: `{"values":[1],"modulus":3,"remainder":3}`},
		{name: "zero window", handle: handler.FixedWindowMinimum, body: `{"values":[1],"window_size":0}`},
		{name: "oversized window", handle: handler.FixedWindowMaximum, body: `{"values":[1],"window_size":2}`},
		{name: "negative max difference", handle: handler.CountPairsAbsDiffAtMostKAfterSort, body: `{"values":[1,2],"max_difference":-1}`},
		{name: "unknown field", handle: handler.CountPairsSumAtMostKAfterSort, body: `{"values":[1,2],"target":3,"extra":true}`},
		{name: "second JSON value", handle: handler.CountPairsSumAtMostKAfterSort, body: `{"values":[1,2],"target":3} {"target":4}`},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder, response := executeRequest(t, test.handle, test.body)
			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
			}
			if _, exists := response["error"]; !exists {
				t.Fatalf("response %v does not contain error", response)
			}
		})
	}
}
