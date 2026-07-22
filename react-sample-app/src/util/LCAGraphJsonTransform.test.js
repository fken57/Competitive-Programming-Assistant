import { buildLCAVisualGraphData } from './LCAGraphJsonTransform';

test('LCA transform highlights both query branches and the root path', () => {
  const graph = buildLCAVisualGraphData(
    [[1, 2], [0, 3, 4], [0, 5], [1], [1], [2]],
    0,
    [3, 5],
    0
  );

  expect(graph.nodes.find(node => node.id === 0).attributes.isLCA).toBe(true);
  expect(graph.nodes.filter(node => node.attributes.isQueryVertex).map(node => node.id)).toEqual([3, 5]);
  expect(graph.edges.filter(edge => edge.attributes.inLeftPath)).toHaveLength(2);
  expect(graph.edges.filter(edge => edge.attributes.inRightPath)).toHaveLength(2);
  expect(graph.nodes.map(node => node.attributes.depth)).toEqual([0, 1, 1, 2, 2, 2]);
});
