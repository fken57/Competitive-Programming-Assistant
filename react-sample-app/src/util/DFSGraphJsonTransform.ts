import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';

export interface DFSRawApiResponse {
  start_vertex: number;
  pre_order: number[];
  post_order: number[];
  parents: number[];
}

export function buildDFSVisualGraphData(
  adjacentList: GraphNeighbor[][],
  data: DFSRawApiResponse | null,
  graphType: 'undirected' | 'directed'
): VisualGraphData | null {
  if (!data) return null;

  const preOrderIndex = new Map(data.pre_order.map((vertex, index) => [vertex, index]));
  const postOrderIndex = new Map(data.post_order.map((vertex, index) => [vertex, index]));
  const depthByVertex = new Map<number, number>([[data.start_vertex, 0]]);
  data.pre_order.forEach(vertex => {
    if (vertex === data.start_vertex) return;
    const parent = data.parents[vertex];
    depthByVertex.set(vertex, (depthByVertex.get(parent) ?? 0) + 1);
  });
  const unreachableDepth = Math.max(0, ...Array.from(depthByVertex.values())) + 1;

  const nodes: VisualNode[] = Array.from({ length: adjacentList.length }, (_, vertex) => ({
    id: vertex,
    label: preOrderIndex.has(vertex)
      ? `${vertex + 1} (pre:${(preOrderIndex.get(vertex) ?? 0) + 1}, post:${(postOrderIndex.get(vertex) ?? 0) + 1})`
      : `${vertex + 1} (unvisited)`,
    isStartNode: vertex === data.start_vertex,
    attributes: {
      visited: preOrderIndex.has(vertex),
      preOrderIndex: preOrderIndex.get(vertex) ?? -1,
      postOrderIndex: postOrderIndex.get(vertex) ?? -1,
      depth: depthByVertex.get(vertex) ?? unreachableDepth,
      orderInLevel: preOrderIndex.get(vertex) ?? vertex,
    },
  }));

  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const edgeId = graphType === 'directed'
        ? `${source}-${target}`
        : [source, target].sort((left, right) => left - right).join('-');
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      const isTreeEdge = data.parents[target] === source
        || (graphType === 'undirected' && data.parents[source] === target);
      edges.push({ source, target, attributes: { isTreeEdge } });
    });
  });

  return { nodes, edges };
}
