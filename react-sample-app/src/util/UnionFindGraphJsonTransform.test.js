import { buildUnionFindVisualGraphs } from './UnionFindGraphJsonTransform';

test('Union-Find transform provides component and parent-forest views', () => {
  const result = buildUnionFindVisualGraphs(
    [[1], [0, 2], [1], [4], [3]],
    { parents: [0, 0, 0, 3, 3], components: [[0, 1, 2], [3, 4]] }
  );

  expect(result.componentGraph.nodes.map(node => node.attributes.componentIndex)).toEqual([0, 0, 0, 1, 1]);
  expect(result.componentGraph.edges).toHaveLength(3);
  expect(result.parentForest.edges.map(edge => [edge.source, edge.target])).toEqual([[0, 1], [0, 2], [3, 4]]);
  expect(result.parentForest.nodes.filter(node => node.attributes.isRoot).map(node => node.id)).toEqual([0, 3]);
});
