import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';

export interface LowLinkRawApiResponse {
  articulation_points: number[];
  bridges: Array<{ from: number; to: number }>;
}

export function buildLowLinkVisualGraphData(
  adjacentList: GraphNeighbor[][],
  data: LowLinkRawApiResponse | null
): VisualGraphData | null {
  if (!data) return null;

  const articulationPoints = new Set(data.articulation_points ?? []);
  const bridges = new Set((data.bridges ?? []).map(bridge =>
    [bridge.from, bridge.to].sort((left, right) => left - right).join('-')
  ));
  const nodes: VisualNode[] = Array.from({ length: adjacentList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
    attributes: { isArticulationPoint: articulationPoints.has(vertex) },
  }));
  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const edgeId = [source, target].sort((left, right) => left - right).join('-');
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      edges.push({ source, target, attributes: { isBridge: bridges.has(edgeId) } });
    });
  });
  return { nodes, edges };
}
