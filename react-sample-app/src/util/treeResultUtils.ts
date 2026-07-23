import { GraphNeighbor } from './BFSGraphJsonTransfrom';

const getNeighborVertex = (neighbor: GraphNeighbor): number =>
  typeof neighbor === 'number' ? neighbor : neighbor.to;

export function isUndirectedTree(adjacencyList: GraphNeighbor[][]): boolean {
  const vertexCount = adjacencyList.length;
  if (vertexCount === 0) return false;

  const degreeSum = adjacencyList.reduce((sum, neighbors) => sum + neighbors.length, 0);
  if (degreeSum % 2 !== 0 || degreeSum / 2 !== vertexCount - 1) return false;

  const visited = Array(vertexCount).fill(false);
  const queue = [0];
  visited[0] = true;

  for (let index = 0; index < queue.length; index++) {
    const vertex = queue[index];
    for (const neighbor of adjacencyList[vertex]) {
      const next = getNeighborVertex(neighbor);
      if (!Number.isInteger(next) || next < 0 || next >= vertexCount) return false;
      if (visited[next]) continue;
      visited[next] = true;
      queue.push(next);
    }
  }

  return visited.every(Boolean);
}

export function analyzeRootedTreePath(adjacencyList: GraphNeighbor[][], start: number, end: number) {
  const parents = Array(adjacencyList.length).fill(-1);
  const depths = Array(adjacencyList.length).fill(-1);
  const queue = [start];
  depths[start] = 0;
  for (let index = 0; index < queue.length; index++) {
    const vertex = queue[index];
    adjacencyList[vertex].forEach(neighbor => {
      const next = getNeighborVertex(neighbor);
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
