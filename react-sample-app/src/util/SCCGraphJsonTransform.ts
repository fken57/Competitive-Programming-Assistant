import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { GraphNeighbor } from './BFSGraphJsonTransfrom';

export interface SCCRawApiResponse {
  sccs: number[][];
}

export interface SCCVisualGraphs {
  condensationGraph: VisualGraphData;
  originalGraph: VisualGraphData;
}

export function buildSCCVisualGraphs(
  adjacentList: GraphNeighbor[][],
  data: SCCRawApiResponse | null
): SCCVisualGraphs | null {
  if (!data?.sccs) return null;

  const componentByVertex = Array(adjacentList.length).fill(-1);
  data.sccs.forEach((component, componentIndex) => {
    component.forEach(vertex => {
      componentByVertex[vertex] = componentIndex;
    });
  });

  const condensationNodes: VisualNode[] = data.sccs.map((component, componentIndex) => ({
    id: componentIndex,
    label: `SCC ${componentIndex + 1}: ${component.map(vertex => vertex + 1).join(', ')}`,
    attributes: { componentIndex, orderIndex: componentIndex },
  }));
  const condensationEdges: VisualEdge[] = [];
  const seenCondensationEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const sourceComponent = componentByVertex[source];
      const targetComponent = componentByVertex[target];
      if (sourceComponent === targetComponent) return;
      const id = `${sourceComponent}-${targetComponent}`;
      if (seenCondensationEdges.has(id)) return;
      seenCondensationEdges.add(id);
      condensationEdges.push({ source: sourceComponent, target: targetComponent });
    });
  });

  const originalNodes: VisualNode[] = Array.from({ length: adjacentList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
    attributes: { componentIndex: componentByVertex[vertex] },
  }));
  const originalEdges: VisualEdge[] = [];
  const seenOriginalEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const id = `${source}-${target}`;
      if (seenOriginalEdges.has(id)) return;
      seenOriginalEdges.add(id);
      originalEdges.push({ source, target });
    });
  });

  return {
    condensationGraph: { nodes: condensationNodes, edges: condensationEdges },
    originalGraph: { nodes: originalNodes, edges: originalEdges },
  };
}

export function buildSCCGraphVisualData(
  adjacentList: GraphNeighbor[][],
  data: SCCRawApiResponse | null
): VisualGraphData | null {
  return buildSCCVisualGraphs(adjacentList, data)?.condensationGraph ?? null;
}
