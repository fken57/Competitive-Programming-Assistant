import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';

export interface DirectedCycleRawApiResponse {
  has_cycle: boolean;
  cycle: number[];
}

export function buildDirectedCycleVisualGraphData(
  adjacentList: GraphNeighbor[][],
  data: DirectedCycleRawApiResponse | null
): VisualGraphData | null {
  if (!data) return null;

  const cycleVertices = new Set(data.cycle ?? []);
  const cycleEdges = new Set<string>();
  for (let index = 0; index + 1 < (data.cycle?.length ?? 0); index++) {
    cycleEdges.add(`${data.cycle[index]}-${data.cycle[index + 1]}`);
  }
  const nodes: VisualNode[] = Array.from({ length: adjacentList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
    attributes: { inCycle: cycleVertices.has(vertex) },
  }));
  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const edgeId = `${source}-${target}`;
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      edges.push({ source, target, attributes: { inCycle: cycleEdges.has(edgeId) } });
    });
  });
  return { nodes, edges };
}
