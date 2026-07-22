import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';

export interface UnionFindRawApiResponse {
  parents: number[];
  components: number[][];
}

export interface UnionFindVisualGraphs {
  componentGraph: VisualGraphData;
  parentForest: VisualGraphData;
}

export function buildUnionFindVisualGraphs(
  adjacentList: GraphNeighbor[][],
  data: UnionFindRawApiResponse | null
): UnionFindVisualGraphs | null {
  if (!data) return null;

  const componentByVertex = new Map<number, number>();
  data.components.forEach((component, componentIndex) => {
    component.forEach(vertex => componentByVertex.set(vertex, componentIndex));
  });
  const baseNodes: VisualNode[] = Array.from({ length: adjacentList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
    attributes: { componentIndex: componentByVertex.get(vertex) ?? -1 },
  }));

  const componentEdges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacentList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const edgeId = [source, target].sort((left, right) => left - right).join('-');
      if (seenEdges.has(edgeId)) return;
      seenEdges.add(edgeId);
      componentEdges.push({ source, target });
    });
  });

  const parentNodes = baseNodes.map(node => {
    const isRoot = data.parents[node.id] === node.id;
    return {
      ...node,
      label: isRoot ? `${node.id + 1} (root)` : node.label,
      attributes: {
        ...node.attributes,
        isRoot,
        depth: isRoot ? 0 : 1,
        orderInLevel: node.id,
      },
    };
  });
  const parentEdges: VisualEdge[] = data.parents.flatMap((parent, vertex) =>
    parent === vertex ? [] : [{ source: parent, target: vertex, attributes: { isParentEdge: true } }]
  );

  return {
    componentGraph: { nodes: baseNodes, edges: componentEdges },
    parentForest: { nodes: parentNodes, edges: parentEdges },
  };
}
