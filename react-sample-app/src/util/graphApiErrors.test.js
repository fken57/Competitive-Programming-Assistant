import { postWeightedGraph } from './CostGraphSendApis';
import { postUnweightedGraph } from './NoCostGraphSendApis';

describe('graph API error messages', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ['weighted', postWeightedGraph, '/weighted-test'],
    ['unweighted', postUnweightedGraph, '/unweighted-test'],
  ])('%s requests surface the backend error message', async (_name, postGraph, endpoint) => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'graph must be a tree' }),
    });

    await expect(postGraph(endpoint, { vertex_count: 3, neighbors: [[], [], []] }))
      .rejects.toThrow('graph must be a tree');
  });

  test('falls back to the HTTP status when the error body is not JSON', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('not JSON')),
    });

    await expect(postWeightedGraph('/weighted-test', { vertex_count: 1, neighbors: [[]] }))
      .rejects.toThrow('HTTP error! status: 500');
  });
});
