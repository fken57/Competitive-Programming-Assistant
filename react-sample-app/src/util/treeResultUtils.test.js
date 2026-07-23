import { isUndirectedTree } from './treeResultUtils';

describe('isUndirectedTree', () => {
  test.each([
    ['the reported disconnected graph', [
      [{ to: 1, weight: 1 }],
      [{ to: 0, weight: 1 }, { to: 4, weight: 2 }],
      [],
      [],
      [{ to: 1, weight: 2 }],
      [],
      [],
      [],
      [],
      [],
    ], false],
    ['a connected tree', [[1], [0, 2], [1]], true],
    ['a cycle', [[1, 2], [0, 2], [0, 1]], false],
    ['a disconnected graph', [[1], [0], [3], [2]], false],
    ['parallel edges', [[1, 1], [0, 0]], false],
    ['a self-loop', [[0, 0]], false],
    ['a singleton', [[]], true],
    ['a weighted tree', [
      [{ to: 1, weight: 3 }],
      [{ to: 0, weight: 3 }, { to: 2, weight: 5 }],
      [{ to: 1, weight: 5 }],
    ], true],
  ])('%s is classified correctly', (_name, adjacencyList, expected) => {
    expect(isUndirectedTree(adjacencyList)).toBe(expected);
  });
});
