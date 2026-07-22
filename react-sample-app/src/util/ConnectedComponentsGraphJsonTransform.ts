import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';

export interface ConnectedComponentsRawApiResponse {
  components: number[][];
}

export function buildConnectedComponentsVisualGraphData(
  adjacentList: GraphNeighbor[][],
  data: ConnectedComponentsRawApiResponse | null
): VisualGraphData | null {
  if (!data) return null;

  const componentByVertex = new Map<number, number>();
  data.components.forEach((component, componentIndex) => {
    component.forEach(vertex => componentByVertex.set(vertex, componentIndex));
  });
  const nodes: VisualNode[] = Array.from({ length: adjacentList.length }, (_, vertex) => ({
    id: vertex,
    label: `${vertex + 1} (C${(componentByVertex.get(vertex) ?? -1) + 1})`,
    attributes: { componentIndex: componentByVertex.get(vertex) ?? -1 },
  }));

  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const edgeId = [source, target].sort((left, right) => left - right).join('-');
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      edges.push({ source, target });
    });
  });

  return { nodes, edges };
}
