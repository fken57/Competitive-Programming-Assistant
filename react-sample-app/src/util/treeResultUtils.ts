import { GraphNeighbor } from './BFSGraphJsonTransfrom';

export function analyzeRootedTreePath(adjacencyList: GraphNeighbor[][], start: number, end: number) {
  const parents = Array(adjacencyList.length).fill(-1);
  const depths = Array(adjacencyList.length).fill(-1);
  const queue = [start];
  depths[start] = 0;
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

  const pathVertices = new Set<number>();
  const pathEdges = new Set<string>();
  if (end >= 0 && end < parents.length && depths[end] !== -1) {
    for (let vertex = end; vertex !== -1; vertex = parents[vertex]) {
      pathVertices.add(vertex);
      if (parents[vertex] !== -1) {
        pathEdges.add([vertex, parents[vertex]].sort((left, right) => left - right).join('-'));
      }
      if (vertex === start) break;
    }
  }
  return { depths, pathVertices, pathEdges };
}
