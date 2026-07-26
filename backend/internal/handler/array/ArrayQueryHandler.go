package handler

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
)

func decodeArrayQueryRequest(context echo.Context, request any) error {
	decoder := json.NewDecoder(context.Request().Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(request); err != nil {
		return err
	}
	var trailingValue any
	if err := decoder.Decode(&trailingValue); !errors.Is(err, io.EOF) {
		if err == nil {
			return errors.New("request body must contain exactly one JSON value")
		}
		return err
	}
	return nil
}

func (handler *ArrayHandler) StaticRangeSumQuery(context echo.Context) error {
	var request StaticRangeSumQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.Left == nil || request.RightExclusive == nil {
		return badRequest(context, errors.New("left and right_exclusive are required"))
	}
	if err := handler.arrayUseCase.ValidateStaticRange(len(request.Values), *request.Left, *request.RightExclusive); err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, RangeSumResponse{
		Sum: handler.arrayUseCase.StaticRangeSumQuery(request.Values, *request.Left, *request.RightExclusive),
	})
}

func (handler *ArrayHandler) CountSubarraysSumEqualK(context echo.Context) error {
	var request TargetArrayQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.Target == nil {
		return badRequest(context, errors.New("target is required"))
	}
	return context.JSON(http.StatusOK, CountResponse{
		Count: handler.arrayUseCase.CountSubarraysSumEqualK(request.Values, *request.Target),
	})
}

func (handler *ArrayHandler) CountSubarraysSumModEqualR(context echo.Context) error {
	var request ModArrayQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.Modulus == nil || request.Remainder == nil {
		return badRequest(context, errors.New("modulus and remainder are required"))
	}
	if err := handler.arrayUseCase.ValidateModQuery(*request.Modulus, *request.Remainder); err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, CountResponse{
		Count: handler.arrayUseCase.CountSubarraysSumModEqualR(request.Values, *request.Modulus, *request.Remainder),
	})
}

func (handler *ArrayHandler) FixedWindowMinimum(context echo.Context) error {
	var request WindowArrayQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.WindowSize == nil {
		return badRequest(context, errors.New("window_size is required"))
	}
	if err := handler.arrayUseCase.ValidateWindowSize(len(request.Values), *request.WindowSize); err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, WindowMinimumResponse{
		Minimums: handler.arrayUseCase.FixedWindowMinimum(request.Values, *request.WindowSize),
	})
}

func (handler *ArrayHandler) FixedWindowMaximum(context echo.Context) error {
	var request WindowArrayQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.WindowSize == nil {
		return badRequest(context, errors.New("window_size is required"))
	}
	if err := handler.arrayUseCase.ValidateWindowSize(len(request.Values), *request.WindowSize); err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, WindowMaximumResponse{
		Maximums: handler.arrayUseCase.FixedWindowMaximum(request.Values, *request.WindowSize),
	})
}

func (handler *ArrayHandler) CountPairsSumAtMostKAfterSort(context echo.Context) error {
	var request TargetArrayQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.Target == nil {
		return badRequest(context, errors.New("target is required"))
	}
	return context.JSON(http.StatusOK, CountResponse{
		Count: handler.arrayUseCase.CountPairsSumAtMostKAfterSort(request.Values, *request.Target),
	})
}

func (handler *ArrayHandler) CountPairsAbsDiffAtMostKAfterSort(context echo.Context) error {
	var request MaxDifferenceArrayQueryRequest
	if err := decodeArrayQueryRequest(context, &request); err != nil {
		return badRequest(context, err)
	}
	if err := handler.arrayUseCase.ValidateValues(request.Values); err != nil {
		return badRequest(context, err)
	}
	if request.MaxDifference == nil {
		return badRequest(context, errors.New("max_difference is required"))
	}
	if err := handler.arrayUseCase.ValidateMaxDifference(*request.MaxDifference); err != nil {
		return badRequest(context, err)
	}
	return context.JSON(http.StatusOK, CountResponse{
		Count: handler.arrayUseCase.CountPairsAbsDiffAtMostKAfterSort(request.Values, *request.MaxDifference),
	})
}
