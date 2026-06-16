export type UnweightedEdge = { u: number; v: number };
export type WeightedEdge = { u: number; v: number; w: number };
export type WeightedAdjacencyListItem = { to: number; weight: number };

/**
 * グラフの入力文字列をパースして、N(頂点数)、M(辺数)、およびエッジのリスト(1-indexedのまま)を取得します。
 * 無向グラフの場合は、逆方向のエッジもリストに追加します。
 */
export const parseUnweightedEdges = (input: string, isDirected: boolean = false): { N: number; M: number; edges: UnweightedEdge[] } => {
  const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return { N: 0, M: 0, edges: [] };

  const [N_str, M_str] = lines[0].split(/\s+/);
  const N = parseInt(N_str, 10);
  const M = parseInt(M_str, 10);

  if (isNaN(N)) return { N: 0, M: 0, edges: [] };

  const edges: UnweightedEdge[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [u_str, v_str] = lines[i].split(/\s+/);
    const u = parseInt(u_str, 10);
    const v = parseInt(v_str, 10);
    if (!isNaN(u) && !isNaN(v)) {
      edges.push({ u, v });
      if (!isDirected) {
        edges.push({ u: v, v: u });
      }
    }
  }

  return { N, M, edges };
};

/**
 * 重み付きグラフの入力文字列をパースして、N(頂点数)、M(辺数)、およびエッジのリスト(1-indexedのまま)を取得します。
 * 無向グラフの場合は、逆方向のエッジもリストに追加します。
 */
export const parseWeightedEdges = (input: string, isDirected: boolean = false): { N: number; M: number; edges: WeightedEdge[] } => {
  const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return { N: 0, M: 0, edges: [] };

  const [N_str, M_str] = lines[0].split(/\s+/);
  const N = parseInt(N_str, 10);
  const M = parseInt(M_str, 10);

  if (isNaN(N)) return { N: 0, M: 0, edges: [] };

  const edges: WeightedEdge[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [u_str, v_str, w_str] = lines[i].split(/\s+/);
    const u = parseInt(u_str, 10);
    const v = parseInt(v_str, 10);
    const w = parseInt(w_str, 10);
    if (!isNaN(u) && !isNaN(v) && !isNaN(w)) {
      edges.push({ u, v, w });
      if (!isDirected) {
        edges.push({ u: v, v: u, w });
      }
    }
  }

  return { N, M, edges };
};

/**
 * 1-indexed のエッジリストを 0-indexed に変換します。(無向・有向グラフ共通)
 */
export const to0IndexedUnweighted = (edges: UnweightedEdge[]): UnweightedEdge[] => {
  return edges.map(e => ({ u: e.u - 1, v: e.v - 1 }));
};

/**
 * 1-indexed のエッジリストを 0-indexed に変換します。(重み付きグラフ共通)
 */
export const to0IndexedWeighted = (edges: WeightedEdge[]): WeightedEdge[] => {
  return edges.map(e => ({ u: e.u - 1, v: e.v - 1, w: e.w }));
};

/**
 * 0-indexed のエッジリストから隣接リストを構築します。
 */
export const buildAdjacencyList = (N: number, edges: UnweightedEdge[]): number[][] => {
  const adjList: number[][] = Array.from({ length: N }, () => []);
  for (const { u, v } of edges) {
    adjList[u].push(v);
  }
  return adjList;
};

/**
 * 0-indexed の重み付きエッジリストから隣接リストを構築します。
 */
export const buildWeightedAdjacencyList = (N: number, edges: WeightedEdge[]): WeightedAdjacencyListItem[][] => {
  const adjList: WeightedAdjacencyListItem[][] = Array.from({ length: N }, () => []);
  for (const { u, v, w } of edges) {
    adjList[u].push({ to: v, weight: w });
  }
  return adjList;
};

/**
 * グラフの入力文字列から0-indexedの隣接リストを一貫して生成するユーティリティ。
 */
export const parseGraphToAdjacencyList = (input: string, isDirected: boolean = false): number[][] => {
  const { N, edges } = parseUnweightedEdges(input, isDirected);
  const zeroIndexedEdges = to0IndexedUnweighted(edges);
  return buildAdjacencyList(N, zeroIndexedEdges);
};

/**
 * 重み付きグラフの入力文字列から0-indexedの隣接リストを一貫して生成するユーティリティ。
 */
export const parseWeightedGraphToAdjacencyList = (input: string, isDirected: boolean = false): WeightedAdjacencyListItem[][] => {
  const { N, edges } = parseWeightedEdges(input, isDirected);
  const zeroIndexedEdges = to0IndexedWeighted(edges);
  return buildWeightedAdjacencyList(N, zeroIndexedEdges);
};
