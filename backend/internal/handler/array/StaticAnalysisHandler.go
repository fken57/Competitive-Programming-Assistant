package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type StaticAnalysisItem struct {
	ID     string      `json:"id"`
	Status string      `json:"status"`
	Data   interface{} `json:"data,omitempty"`
	Reason string      `json:"reason,omitempty"`
}

type StaticAnalysisResponse struct {
	Results []StaticAnalysisItem `json:"results"`
}

func (handler *ArrayHandler) AnalyzeStatic(context echo.Context) error {
	values, err := handler.decodeValues(context)
	if err != nil {
		return badRequest(context, err)
	}

	compression := handler.arrayUseCase.CompressValues(values)
	runs := handler.arrayUseCase.RunLengthEncoding(values)
	responseRuns := make([]RunResponse, len(runs))
	for index, run := range runs {
		responseRuns[index] = RunResponse{Value: run.Value, Count: run.Count}
	}
	nextGreater := handler.arrayUseCase.NextGreaterToRightStrict(values)
	nextSmaller := handler.arrayUseCase.NextSmallerToRightStrict(values)
	longestDistinct := handler.arrayUseCase.LongestDistinctSubarray(values)

	results := []StaticAnalysisItem{
		{ID: "build_prefix_sum", Status: "success", Data: PrefixSumResponse{PrefixSum: handler.arrayUseCase.BuildPrefixSum(values)}},
		{ID: "compress_values", Status: "success", Data: CompressionResponse{CompressedValues: compression.CompressedValues, DistinctValues: compression.DistinctValues}},
		{ID: "count_inversions", Status: "success", Data: InversionCountResponse{InversionCount: handler.arrayUseCase.CountInversions(values)}},
		{ID: "static_mex", Status: "success", Data: StaticMexResponse{Mex: handler.arrayUseCase.StaticMex(values)}},
		{ID: "run_length_encoding", Status: "success", Data: RunLengthEncodingResponse{Runs: responseRuns}},
		{ID: "next_greater_to_right_strict", Status: "success", Data: NextRightResponse{NextIndices: nextGreater.Indices, NextValues: nextGreater.Values}},
		{ID: "next_smaller_to_right_strict", Status: "success", Data: NextRightResponse{NextIndices: nextSmaller.Indices, NextValues: nextSmaller.Values}},
		{ID: "longest_distinct_subarray", Status: "success", Data: LongestDistinctSubarrayResponse{
			Length: longestDistinct.Length, Left: longestDistinct.Left,
			RightExclusive: longestDistinct.RightExclusive, Values: longestDistinct.Values,
		}},
	}
	return context.JSON(http.StatusOK, StaticAnalysisResponse{Results: results})
}
