package handler

import (
	arrayusecase "backend/internal/usecase/array"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
)

type ArrayHandler struct {
	arrayUseCase *arrayusecase.ArrayUseCase
}

func NewArrayHandler(arrayUseCase *arrayusecase.ArrayUseCase) *ArrayHandler {
	return &ArrayHandler{arrayUseCase: arrayUseCase}
}

func (handler *ArrayHandler) decodeValues(context echo.Context) ([]int64, error) {
	var request ArrayRequest
	decoder := json.NewDecoder(context.Request().Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil {
		return nil, err
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return nil, err
	}
	return request.Values, nil
}

func badRequest(context echo.Context, err error) error {
	return context.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
}

func (handler *ArrayHandler) BuildPrefixSum(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, PrefixSumResponse{
		PrefixSum: handler.arrayUseCase.BuildPrefixSum(values),
	})
}

func (handler *ArrayHandler) CompressValues(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	result := handler.arrayUseCase.CompressValues(values)
	return context.JSON(http.StatusOK, CompressionResponse{
		CompressedValues: result.CompressedValues,
		DistinctValues:   result.DistinctValues,
	})
}

func (handler *ArrayHandler) CountInversions(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, InversionCountResponse{
		InversionCount: handler.arrayUseCase.CountInversions(values),
	})
}

func (handler *ArrayHandler) StaticMex(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, StaticMexResponse{
		Mex: handler.arrayUseCase.StaticMex(values),
	})
}

func (handler *ArrayHandler) RunLengthEncoding(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	runs := handler.arrayUseCase.RunLengthEncoding(values)
	responseRuns := make([]RunResponse, len(runs))
	for index, run := range runs {
		responseRuns[index] = RunResponse{Value: run.Value, Count: run.Count}
	}
	return context.JSON(http.StatusOK, RunLengthEncodingResponse{Runs: responseRuns})
}

func (handler *ArrayHandler) NextGreaterToRightStrict(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	result := handler.arrayUseCase.NextGreaterToRightStrict(values)
	return context.JSON(http.StatusOK, NextRightResponse{
		NextIndices: result.Indices,
		NextValues:  result.Values,
	})
}

func (handler *ArrayHandler) NextSmallerToRightStrict(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	result := handler.arrayUseCase.NextSmallerToRightStrict(values)
	return context.JSON(http.StatusOK, NextRightResponse{
		NextIndices: result.Indices,
		NextValues:  result.Values,
	})
}

func (handler *ArrayHandler) LongestDistinctSubarray(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}
	result := handler.arrayUseCase.LongestDistinctSubarray(values)
	return context.JSON(http.StatusOK, LongestDistinctSubarrayResponse{
		Length:         result.Length,
		Left:           result.Left,
		RightExclusive: result.RightExclusive,
		Values:         result.Values,
	})
}
