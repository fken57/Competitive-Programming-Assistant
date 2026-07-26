import { act, renderHook } from '@testing-library/react';
import { useArrayQueryApi } from './useArrayQueryApi';
import { postArrayQuery } from '../../util/ArrayQueryApi';

jest.mock('../../util/ArrayQueryApi', () => ({
  postArrayQuery: jest.fn(),
}));

describe('useArrayQueryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('stores a successful query result', async () => {
    postArrayQuery.mockResolvedValue({ count: 3 });
    const { result } = renderHook(() => useArrayQueryApi());

    await act(async () => {
      await result.current.executeQuery(
        '/array/count_subarrays_sum_equal_k',
        { values: [1, -1, 1], target: 1 },
      );
    });

    expect(result.current.data).toEqual({ count: 3 });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('stores failures and can clear the rendered result', async () => {
    postArrayQuery.mockRejectedValue(new Error('invalid query'));
    const { result } = renderHook(() => useArrayQueryApi());

    await act(async () => {
      await result.current.executeQuery(
        '/array/fixed_window_minimum',
        { values: [1], window_size: 0 },
      );
    });
    expect(result.current.error).toEqual(new Error('invalid query'));

    act(() => result.current.clearQueryResult());
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  test('ignores an older response that arrives after a newer query', async () => {
    let resolveFirst;
    let resolveSecond;
    postArrayQuery
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));
    const { result } = renderHook(() => useArrayQueryApi());

    let firstRequest;
    let secondRequest;
    act(() => {
      firstRequest = result.current.executeQuery('/array/count_subarrays_sum_equal_k', {
        values: [1], target: 1,
      });
      secondRequest = result.current.executeQuery('/array/count_subarrays_sum_equal_k', {
        values: [2], target: 2,
      });
    });
    await act(async () => {
      resolveSecond({ count: 2 });
      await secondRequest;
    });
    await act(async () => {
      resolveFirst({ count: 1 });
      await firstRequest;
    });

    expect(result.current.data).toEqual({ count: 2 });
    expect(result.current.loading).toBe(false);
  });
});
