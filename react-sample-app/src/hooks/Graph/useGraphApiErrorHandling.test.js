import { act, renderHook } from '@testing-library/react';
import { useWeightedGraphApi } from './useWeightedGraphApi';
import { useUnweightedGraphApi } from './useUnweightedGraphApi';
import { postWeightedGraph } from '../../util/CostGraphSendApis';
import { postUnweightedGraph } from '../../util/NoCostGraphSendApis';

jest.mock('../../util/CostGraphSendApis', () => ({
  postWeightedGraph: jest.fn(),
}));
jest.mock('../../util/NoCostGraphSendApis', () => ({
  postUnweightedGraph: jest.fn(),
}));

describe('graph API hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['weighted', useWeightedGraphApi, postWeightedGraph],
    ['unweighted', useUnweightedGraphApi, postUnweightedGraph],
  ])('%s failures become renderable error state without rejecting the click handler', async (_name, useGraphApi, postGraph) => {
    postGraph.mockRejectedValue(new Error('graph must be a tree'));
    const { result } = renderHook(() => useGraphApi());
    let requestResult;

    await act(async () => {
      requestResult = await result.current.postGraphData('/test', {
        vertex_count: 3,
        neighbors: [[], [], []],
      });
    });

    expect(requestResult).toBeNull();
    expect(result.current.error).toEqual(new Error('graph must be a tree'));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
