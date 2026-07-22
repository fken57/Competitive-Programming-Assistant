import { buildTopologicalSortVisualGraphData } from './TopologicalSortGraphJsonTransform';

test('topological transform assigns the returned linear order', () => {
  const graph = buildTopologicalSortVisualGraphData(
    [[1, 2], [3], [3], []],
    { sortable: true, vertices: [0, 1, 2, 3], cycle: [] }
  );
  expect(graph.nodes.map(node => node.attributes.orderIndex)).toEqual([0, 1, 2, 3]);
  expect(graph.nodes.every(node => node.attributes.hasOrder)).toBe(true);
});

test('topological transform highlights the failure cycle', () => {
  const graph = buildTopologicalSortVisualGraphData(
    [[1], [2], [0, 3], []],
    { sortable: false, vertices: [], cycle: [0, 1, 2, 0] }
  );
  expect(graph.nodes.filter(node => node.attributes.inCycle).map(node => node.id)).toEqual([0, 1, 2]);
  expect(graph.edges.filter(edge => edge.attributes.inCycle)).toHaveLength(3);
});
