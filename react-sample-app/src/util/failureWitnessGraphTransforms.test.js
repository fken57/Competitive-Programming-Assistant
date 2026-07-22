import { buildBipartiteVisualGraphData } from './BipatiteGraphJsonTransfrom';
import { buildIsTreeVisualGraphData } from './IsTreeGraphJsonTransform';

const triangle = [[1, 2], [0, 2], [0, 1]];

test('bipartite transform marks the odd-cycle witness', () => {
  const graph = buildBipartiteVisualGraphData(triangle, {
    is_binary_tree: false,
    group_one: [],
    group_two: [],
    odd_cycle: [0, 1, 2, 0],
  });

  expect(graph.nodes.every(node => node.attributes.inOddCycle)).toBe(true);
  expect(graph.edges.filter(edge => edge.attributes.inOddCycle)).toHaveLength(3);
});

test('tree transform marks cycle edges and disconnected components', () => {
  const adjacencyList = [[1, 2], [0, 2], [0, 1], []];
  const graph = buildIsTreeVisualGraphData(adjacencyList, {
    is_tree: false,
    cycle: [0, 1, 2, 0],
    components: [[0, 1, 2], [3]],
  });

  expect(graph.nodes.map(node => node.attributes.componentIndex)).toEqual([0, 0, 0, 1]);
  expect(graph.edges.filter(edge => edge.attributes.inCycle)).toHaveLength(3);
  expect(graph.nodes[3].attributes.inCycle).toBe(false);
});
