import { buildDFSVisualGraphData } from './DFSGraphJsonTransform';
import { buildConnectedComponentsVisualGraphData } from './ConnectedComponentsGraphJsonTransform';

test('DFS transform marks tree edges and assigns tree depth', () => {
  const graph = buildDFSVisualGraphData(
    [[1, 2], [3], [3], []],
    { start_vertex: 0, pre_order: [0, 1, 3, 2], post_order: [3, 1, 2, 0], parents: [-1, 0, 0, 1] },
    'directed'
  );

  expect(graph.nodes.map(node => node.attributes.depth)).toEqual([0, 1, 1, 2]);
  expect(graph.edges.filter(edge => edge.attributes.isTreeEdge).map(edge => [edge.source, edge.target]))
    .toEqual([[0, 1], [0, 2], [1, 3]]);
  expect(graph.edges.find(edge => edge.source === 2 && edge.target === 3).attributes.isTreeEdge).toBe(false);
});

test('connected-components transform assigns a group to every vertex', () => {
  const graph = buildConnectedComponentsVisualGraphData(
    [[1], [0], [3], [2], []],
    { components: [[0, 1], [2, 3], [4]] }
  );

  expect(graph.nodes.map(node => node.attributes.componentIndex)).toEqual([0, 0, 1, 1, 2]);
  expect(graph.edges).toHaveLength(2);
});
