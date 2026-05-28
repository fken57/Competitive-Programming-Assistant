export type ParsedEdge = {
  from: number;
  to: number;
};

/**
 * Parses multiline string edge lists (e.g. "0 1\n0 2") into objects.
 */
export function parseEdgeInput(text: string, isDirected: boolean): ParsedEdge[] {
  const lines = text.split('\n');
  const edges: ParsedEdge[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const parts = line.trim().split(/\s+/).map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) continue;

    const [u, v] = parts;
    const key = isDirected ? `${u}-${v}` : [u, v].sort().join('-');
    if (seen.has(key)) continue;
    seen.add(key);

    edges.push({ from: u, to: v });
  }
  return edges;
}

/**
 * Assembles a standard 0-indexed adjacency list for API requests.
 */
export function buildAdjacencyList(vertexCount: number, edges: ParsedEdge[], isDirected: boolean): number[][] {
  const adj: number[][] = Array.from({ length: vertexCount }, () => []);
  
  for (const edge of edges) {
    if (edge.from >= vertexCount || edge.to >= vertexCount || edge.from < 0 || edge.to < 0) continue;
    adj[edge.from].push(edge.to);
    
    if (!isDirected) {
      adj[edge.to].push(edge.from);
    }
  }
  
  return adj;
}
