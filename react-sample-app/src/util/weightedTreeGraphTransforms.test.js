import { buildTreeDistanceVisualGraphData } from './TreeDistanceGraphJsonTransform';
import { buildPrimVisualGraphData, buildWeightedTreeDiameterVisualGraphData } from './WeightedResultGraphTransforms';

test('unweighted diameter transform highlights the full endpoint path', () => {
  const graph = buildTreeDistanceVisualGraphData(
    [[1], [0, 2, 3], [1], [1]],
    { tree_dir: 2, vertex1: 2, vertex2: 3 }
  );
  expect(graph.edges.filter(edge => edge.attributes.inDiameterPath)).toHaveLength(2);
  expect(graph.nodes.filter(node => node.attributes.isEndpoint).map(node => node.id)).toEqual([2, 3]);
});

test('Prim transform highlights only selected forest edges', () => {
  const adjacencyList = [
    [{ to: 1, weight: 1 }, { to: 2, weight: 5 }],
    [{ to: 0, weight: 1 }, { to: 2, weight: 2 }],
    [{ to: 0, weight: 5 }, { to: 1, weight: 2 }],
  ];
  const graph = buildPrimVisualGraphData(adjacencyList, {
    total_weight: 3,
    is_spanning: true,
    edges: [{ from: 0, to: 1, weight: 1 }, { from: 1, to: 2, weight: 2 }],
  });
  expect(graph.edges.filter(edge => edge.attributes.inSpanningForest)).toHaveLength(2);
  expect(graph.edges).toHaveLength(3);
});

test('weighted diameter transform preserves weights and highlights its path', () => {
  const graph = buildWeightedTreeDiameterVisualGraphData(
    [[{ to: 1, weight: 4 }], [{ to: 0, weight: 4 }, { to: 2, weight: 7 }], [{ to: 1, weight: 7 }]],
    { diameter: 11, vertex1: 0, vertex2: 2 }
  );
  expect(graph.edges.map(edge => edge.weight)).toEqual([4, 7]);
  expect(graph.edges.every(edge => edge.attributes.inDiameterPath)).toBe(true);
});
