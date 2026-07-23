import {
  MAX_GRAPH_VISUALIZATION_NODES,
  canVisualizeGraph,
} from './graphVisualizationPolicy';

const graphWith = (nodeCount) => ({
  nodes: Array.from({ length: nodeCount }, (_, id) => ({ id, label: String(id + 1) })),
  edges: [],
});

test('allows exactly the visualization limit', () => {
  expect(canVisualizeGraph(graphWith(MAX_GRAPH_VISUALIZATION_NODES))).toBe(true);
});

test('rejects graphs above the visualization limit', () => {
  expect(canVisualizeGraph(graphWith(MAX_GRAPH_VISUALIZATION_NODES + 1))).toBe(false);
  expect(canVisualizeGraph(graphWith(10_000))).toBe(false);
});

test('rejects missing graph data', () => {
  expect(canVisualizeGraph(null)).toBe(false);
});
