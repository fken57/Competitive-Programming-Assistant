import { buildDirectedCycleVisualGraphData } from './DirectedCycleGraphJsonTransform';
import { buildLowLinkVisualGraphData } from './LowLinkGraphJsonTransform';

test('directed-cycle transform highlights only witness edges', () => {
  const graph = buildDirectedCycleVisualGraphData(
    [[1], [2], [0, 3], []],
    { has_cycle: true, cycle: [0, 1, 2, 0] }
  );

  expect(graph.edges.filter(edge => edge.attributes.inCycle).map(edge => [edge.source, edge.target]))
    .toEqual([[0, 1], [1, 2], [2, 0]]);
  expect(graph.nodes[3].attributes.inCycle).toBe(false);
});

test('low-link transform marks articulation points and bridges', () => {
  const graph = buildLowLinkVisualGraphData(
    [[1], [0, 2, 3], [1], [1, 4, 5], [3, 5], [3, 4]],
    { articulation_points: [1, 3], bridges: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }] }
  );

  expect(graph.nodes.filter(node => node.attributes.isArticulationPoint).map(node => node.id)).toEqual([1, 3]);
  expect(graph.edges.filter(edge => edge.attributes.isBridge)).toHaveLength(3);
});
