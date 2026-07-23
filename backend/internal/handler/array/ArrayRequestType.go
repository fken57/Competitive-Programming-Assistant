package handler

type ArrayRequest struct {
	Values []int64 `json:"values"`
}

type PrefixSumResponse struct {
	PrefixSum []int64 `json:"prefix_sum"`
}

type CompressionResponse struct {
	CompressedValues []int   `json:"compressed_values"`
	DistinctValues   []int64 `json:"distinct_values"`
}

type InversionCountResponse struct {
	InversionCount int64 `json:"inversion_count"`
}

type StaticMexResponse struct {
	Mex int `json:"mex"`
}

type RunResponse struct {
	Value int64 `json:"value"`
	Count int   `json:"count"`
}

type RunLengthEncodingResponse struct {
	Runs []RunResponse `json:"runs"`
}

type NextRightResponse struct {
	NextIndices []int    `json:"next_indices"`
	NextValues  []*int64 `json:"next_values"`
}

type LongestDistinctSubarrayResponse struct {
	Length         int     `json:"length"`
	Left           int     `json:"left"`
	RightExclusive int     `json:"right_exclusive"`
	Values         []int64 `json:"values"`
}
