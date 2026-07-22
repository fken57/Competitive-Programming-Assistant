import { buildSCCVisualGraphs } from './SCCGraphJsonTransform';

test('SCC transform builds a deduplicated condensation graph and colored original graph', () => {
  const result = buildSCCVisualGraphs(
    [[1, 2], [0, 2], [3], [2]],
    { sccs: [[0, 1], [2, 3]] }
  );

  expect(result.condensationGraph.nodes).toHaveLength(2);
  expect(result.condensationGraph.edges).toEqual([{ source: 0, target: 1 }]);
  expect(result.originalGraph.nodes.map(node => node.attributes.componentIndex)).toEqual([0, 0, 1, 1]);
  expect(result.originalGraph.edges).toHaveLength(6);
});
