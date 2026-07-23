import { act, renderHook } from '@testing-library/react';
import { useArrayApi } from './useArrayApi';
import { postArray } from '../../util/ArraySendApis';

jest.mock('../../util/ArraySendApis', () => ({
  postArray: jest.fn(),
}));

describe('useArrayApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('stores successful results', async () => {
    postArray.mockResolvedValue({ mex: 2 });
    const { result } = renderHook(() => useArrayApi());

    await act(async () => {
      await result.current.postArrayData('/array/static_mex', [0, 1, 3]);
    });

    expect(result.current.data).toEqual({ mex: 2 });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('turns failures into renderable state without rejecting the click handler', async () => {
    postArray.mockRejectedValue(new Error('values are invalid'));
    const { result } = renderHook(() => useArrayApi());
    let requestResult;

    await act(async () => {
      requestResult = await result.current.postArrayData('/array/static_mex', []);
    });

    expect(requestResult).toBeNull();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(new Error('values are invalid'));
    expect(result.current.loading).toBe(false);
  });
});
