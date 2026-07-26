package handler

type StaticRangeSumQueryRequest struct {
	Values         []int64 `json:"values"`
	Left           *int    `json:"left"`
	RightExclusive *int    `json:"right_exclusive"`
}

type TargetArrayQueryRequest struct {
	Values []int64 `json:"values"`
	Target *int64  `json:"target"`
}

type ModArrayQueryRequest struct {
	Values    []int64 `json:"values"`
	Modulus   *int64  `json:"modulus"`
	Remainder *int64  `json:"remainder"`
}

type WindowArrayQueryRequest struct {
	Values     []int64 `json:"values"`
	WindowSize *int    `json:"window_size"`
}

type MaxDifferenceArrayQueryRequest struct {
	Values        []int64 `json:"values"`
	MaxDifference *int64  `json:"max_difference"`
}

type RangeSumResponse struct {
	Sum int64 `json:"sum"`
}

type CountResponse struct {
	Count int64 `json:"count"`
}

type WindowMinimumResponse struct {
	Minimums []int64 `json:"minimums"`
}

type WindowMaximumResponse struct {
	Maximums []int64 `json:"maximums"`
}
