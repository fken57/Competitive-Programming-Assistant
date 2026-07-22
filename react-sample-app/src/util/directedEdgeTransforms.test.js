import { buildBFSVisualGraphData } from './BFSGraphJsonTransfrom';
import { buildDijkstraVisualGraphData } from './DijkstraGraphJsonTransform';

test('BFS keeps opposite directed edges but deduplicates undirected edges', () => {
  const adjacencyList = [[1], [0]];
  const response = { start_vertex: 0, visited_vertices: [0, 1] };

  expect(buildBFSVisualGraphData(adjacencyList, response, 'directed').edges).toHaveLength(2);
  expect(buildBFSVisualGraphData(adjacencyList, response, 'undirected').edges).toHaveLength(1);
});

test('Dijkstra keeps opposite directed edges and deduplicates an undirected pair', () => {
  const adjacencyList = [[{ to: 1, weight: 4 }], [{ to: 0, weight: 4 }]];
  const response = { start_vertex: 0, distances: [0, 4], previous: [-1, 0] };

  expect(buildDijkstraVisualGraphData(adjacencyList, response, 'directed').edges).toHaveLength(2);
  const undirectedEdges = buildDijkstraVisualGraphData(adjacencyList, response, 'undirected').edges;
  expect(undirectedEdges).toHaveLength(1);
  expect(undirectedEdges[0].isShortestPath).toBe(true);
});
