import { WeightedEdge } from './CostGraphSendApis';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';
import { analyzeRootedTreePath } from './treeResultUtils';

export interface PrimRawApiResponse {
  total_weight: number;
  is_spanning: boolean;
  edges: Array<{ from: number; to: number; weight: number }>;
}

export interface WeightedTreeDiameterRawApiResponse {
  diameter: number;
  vertex1: number;
  vertex2: number;
}

const undirectedEdgeId = (left: number, right: number) =>
  [left, right].sort((first, second) => first - second).join('-');

export function buildPrimVisualGraphData(
  adjacencyList: WeightedEdge[][],
  data: PrimRawApiResponse | null
): VisualGraphData | null {
  if (!data) return null;
  const selectedEdges = new Set(data.edges.map(edge => undirectedEdgeId(edge.from, edge.to)));
  const nodes: VisualNode[] = Array.from({ length: adjacencyList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
  }));
  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacencyList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const edgeId = undirectedEdgeId(source, neighbor.to);
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      edges.push({
        source,
        target: neighbor.to,
        weight: neighbor.weight,
        attributes: { inSpanningForest: selectedEdges.has(edgeId) },
      });
    });
  });
  return { nodes, edges };
}

export function buildWeightedTreeDiameterVisualGraphData(
  adjacencyList: WeightedEdge[][],
  data: WeightedTreeDiameterRawApiResponse | null
): VisualGraphData | null {
  if (!data) return null;
  const path = analyzeRootedTreePath(adjacencyList, data.vertex1, data.vertex2);
  const nodes: VisualNode[] = Array.from({ length: adjacencyList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
    attributes: {
      isEndpoint: vertex === data.vertex1 || vertex === data.vertex2,
      inDiameterPath: path.pathVertices.has(vertex),
      depth: path.depths[vertex] < 0 ? adjacencyList.length : path.depths[vertex],
      orderInLevel: vertex,
    },
  }));
  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacencyList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const edgeId = undirectedEdgeId(source, neighbor.to);
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      edges.push({
        source,
        target: neighbor.to,
        weight: neighbor.weight,
        attributes: { inDiameterPath: path.pathEdges.has(edgeId) },
      });
    });
  });
  return { nodes, edges };
}
