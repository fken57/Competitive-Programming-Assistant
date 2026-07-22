import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { VisualEdge, VisualGraphData, VisualNode } from './graphUtils';

const edgeId = (left: number, right: number) =>
  [left, right].sort((first, second) => first - second).join('-');

export function buildLCAVisualGraphData(
  adjacencyList: GraphNeighbor[][],
  root: number,
  query: [number, number] | undefined,
  lca: number | undefined
): VisualGraphData | null {
  if (!query || lca === undefined) return null;

  const parents = Array(adjacencyList.length).fill(-1);
  const depths = Array(adjacencyList.length).fill(-1);
  const queue = [root];
  parents[root] = root;
  depths[root] = 0;
  for (let index = 0; index < queue.length; index++) {
    const vertex = queue[index];
    adjacencyList[vertex].forEach(neighbor => {
      const next = typeof neighbor === 'number' ? neighbor : neighbor.to;
      if (depths[next] !== -1) return;
      parents[next] = vertex;
      depths[next] = depths[vertex] + 1;
      queue.push(next);
    });
  }

  const pathToAncestor = (start: number, ancestor: number) => {
    const path = new Set<string>();
    for (let vertex = start; vertex !== ancestor && parents[vertex] !== -1; vertex = parents[vertex]) {
      path.add(edgeId(vertex, parents[vertex]));
    }
    return path;
  };
  const leftPath = pathToAncestor(query[0], lca);
  const rightPath = pathToAncestor(query[1], lca);
  const rootPath = pathToAncestor(lca, root);

  const nodes: VisualNode[] = Array.from({ length: adjacencyList.length }, (_, vertex) => ({
    id: vertex,
    label: (vertex + 1).toString(),
    attributes: {
      isRoot: vertex === root,
      isQueryVertex: vertex === query[0] || vertex === query[1],
      isLCA: vertex === lca,
      depth: depths[vertex] < 0 ? adjacencyList.length : depths[vertex],
      orderInLevel: vertex,
    },
  }));
  const edges: VisualEdge[] = [];
  const seenEdges = new Set<string>();
  adjacencyList.forEach((neighbors, source) => {
    neighbors.forEach(neighbor => {
      const target = typeof neighbor === 'number' ? neighbor : neighbor.to;
      const id = edgeId(source, target);
      if (seenEdges.has(id)) return;
      seenEdges.add(id);
      edges.push({
        source,
        target,
        attributes: {
          inLeftPath: leftPath.has(id),
          inRightPath: rightPath.has(id),
          inRootPath: rootPath.has(id),
        },
      });
    });
  });
  return { nodes, edges };
}
