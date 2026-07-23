package handler

import (
	arrayusecase "backend/internal/usecase/array"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func executeRequest(t *testing.T, handler echo.HandlerFunc, body string) (*httptest.ResponseRecorder, map[string]any) {
	t.Helper()
	echoServer := echo.New()
	request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	recorder := httptest.NewRecorder()
	if err := handler(echoServer.NewContext(request, recorder)); err != nil {
		t.Fatalf("handler returned error: %v", err)
	}
	var response map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("response is not JSON: %v", err)
	}
	return recorder, response
}

func TestArrayHandlersExposeAllStaticResults(t *testing.T) {
	handler := NewArrayHandler(arrayusecase.NewArrayUseCase())
	tests := []struct {
		name        string
		handle      echo.HandlerFunc
		responseKey string
	}{
		{name: "prefix sum", handle: handler.BuildPrefixSum, responseKey: "prefix_sum"},
		{name: "compression", handle: handler.CompressValues, responseKey: "compressed_values"},
		{name: "inversions", handle: handler.CountInversions, responseKey: "inversion_count"},
		{name: "mex", handle: handler.StaticMex, responseKey: "mex"},
		{name: "run length encoding", handle: handler.RunLengthEncoding, responseKey: "runs"},
		{name: "next greater", handle: handler.NextGreaterToRightStrict, responseKey: "next_indices"},
		{name: "next smaller", handle: handler.NextSmallerToRightStrict, responseKey: "next_indices"},
		{name: "longest distinct", handle: handler.LongestDistinctSubarray, responseKey: "length"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder, response := executeRequest(t, test.handle, `{"values":[3,1,2,1]}`)
			if recorder.Code != http.StatusOK {
				t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
			}
			if _, exists := response[test.responseKey]; !exists {
				t.Fatalf("response %v does not contain %q", response, test.responseKey)
			}
		})
	}
}

func TestArrayHandlerRejectsInvalidRequests(t *testing.T) {
	handler := NewArrayHandler(arrayusecase.NewArrayUseCase())
	tests := []struct {
		name string
		body string
	}{
		{name: "invalid JSON", body: `{"values":[1,}`},
		{name: "empty array", body: `{"values":[]}`},
		{name: "missing values", body: `{}`},
		{name: "value out of range", body: `{"values":[1000000001]}`},
		{name: "unknown field", body: `{"values":[1],"extra":true}`},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder, response := executeRequest(t, handler.StaticMex, test.body)
			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400", recorder.Code)
			}
			if _, exists := response["error"]; !exists {
				t.Fatalf("response %v does not contain error", response)
			}
		})
	}
}
