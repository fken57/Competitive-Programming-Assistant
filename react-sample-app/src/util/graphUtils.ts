export type UnweightedEdge = { u: number; v: number };
export type WeightedEdge = { u: number; v: number; w: number };
export type WeightedAdjacencyListItem = { to: number; weight: number };

export type VisualNode = {
    id: number;
    label: string;
    weight?: number;
    isStartNode?: boolean;
    attributes?: Record<string, any>;
    color?: string;
};

export type VisualEdge = {
    source: number;
    target: number;
    weight?: number;
    isStartEdge?: boolean;
    attributes?: Record<string, any>;
    color?: string;
};

export type VisualGraphData = {
    nodes: VisualNode[];
    edges: VisualEdge[];
};

/**
 * グラフの入力文字列をパースして、N(頂点数)、M(辺数)、およびエッジのリスト(1-indexedのまま)を取得します。
 * 無向グラフの場合は、逆方向のエッジもリストに追加します。
 * 入力フォーマットが不正な場合は Error をスローします。
 */
export const parseUnweightedEdges = (input: string, isDirected: boolean = false): { N: number; M: number; edges: UnweightedEdge[] } => {
  const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) {
    throw new Error("入力が空です。N M とエッジ情報を入力してください。");
  }

  const [N_str, M_str] = lines[0].split(/\s+/);
  const N = parseInt(N_str, 10);
  const M = parseInt(M_str, 10);

  if (isNaN(N) || isNaN(M)) {
    throw new Error("1行目のフォーマットが不正です。頂点数N と 辺数M をスペース区切りで入力してください。");
  }

  if (lines.length - 1 !== M) {
    throw new Error(`辺の数が一致しません。M=${M} が指定されていますが、実際の辺の入力は ${lines.length - 1} 行です。`);
  }

  const edges: UnweightedEdge[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\s+/);
    if (parts.length < 2) {
      throw new Error(`${i + 1}行目の入力が不正です。2つの頂点 u v を入力してください。`);
    }
    const u = parseInt(parts[0], 10);
    const v = parseInt(parts[1], 10);
    
    if (isNaN(u) || isNaN(v)) {
      throw new Error(`${i + 1}行目の頂点指定が数値ではありません。`);
    }
    if (u < 1 || u > N || v < 1 || v > N) {
      throw new Error(`${i + 1}行目の頂点が範囲外です。1 から ${N} の間で指定してください。`);
    }

    edges.push({ u, v });
    if (!isDirected) {
      edges.push({ u: v, v: u });
    }
  }

  return { N, M, edges };
};

/**
 * 重み付きグラフの入力文字列をパースして、N(頂点数)、M(辺数)、およびエッジのリスト(1-indexedのまま)を取得します。
 * 無向グラフの場合は、逆方向のエッジもリストに追加します。
 * 入力フォーマットが不正な場合は Error をスローします。
 */
export const parseWeightedEdges = (input: string, isDirected: boolean = false): { N: number; M: number; edges: WeightedEdge[] } => {
  const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) {
    throw new Error("入力が空です。N M とエッジ情報を入力してください。");
  }

  const [N_str, M_str] = lines[0].split(/\s+/);
  const N = parseInt(N_str, 10);
  const M = parseInt(M_str, 10);

  if (isNaN(N) || isNaN(M)) {
    throw new Error("1行目のフォーマットが不正です。頂点数N と 辺数M をスペース区切りで入力してください。");
  }

  if (lines.length - 1 !== M) {
    throw new Error(`辺の数が一致しません。M=${M} が指定されていますが、実際の辺の入力は ${lines.length - 1} 行です。`);
  }

  const edges: WeightedEdge[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\s+/);
    if (parts.length < 3) {
      throw new Error(`${i + 1}行目の入力が不正です。2つの頂点 u v と重み w を入力してください。`);
    }
    const u = parseInt(parts[0], 10);
    const v = parseInt(parts[1], 10);
    const w = parseInt(parts[2], 10);
    
    if (isNaN(u) || isNaN(v) || isNaN(w)) {
      throw new Error(`${i + 1}行目の指定が数値ではありません。`);
    }
    if (u < 1 || u > N || v < 1 || v > N) {
      throw new Error(`${i + 1}行目の頂点が範囲外です。1 から ${N} の間で指定してください。`);
    }

    edges.push({ u, v, w });
    if (!isDirected) {
      edges.push({ u: v, v: u, w });
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
/**
 * N（頂点数）とパース済みのエッジリストから、D3.js等で描画しやすい VisualGraphData を生成します。
 * （無向グラフでの重複エッジのレンダリングを防ぎます）
 */
export const buildVisualGraphData = (
  N: number,
  edges: (UnweightedEdge | WeightedEdge)[],
  isDirected: boolean,
  isWeighted: boolean
): VisualGraphData => {
  const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => ({
    id: i,
    label: (i + 1).toString(), // 1-indexed for display
  }));

  const visualEdges: VisualEdge[] = [];
  const seenEdges = new Set<string>();

  for (const edge of edges) {
    const source = edge.u - 1; // Convert 1-indexed to 0-indexed for visualization
    const target = edge.v - 1;
    
    // 無向グラフの描画重複を防ぐ
    if (!isDirected) {
      const edgeId = [source, target].sort().join('-');
      if (seenEdges.has(edgeId)) continue;
      seenEdges.add(edgeId);
    }

    const visualEdge: VisualEdge = { source, target };
    if (isWeighted && 'w' in edge) {
      visualEdge.weight = edge.w;
    }
    visualEdges.push(visualEdge);
  }

  return { nodes, edges: visualEdges };
};
/**
 * グラフの入力文字列から、アルゴリズム用の隣接リストと描画用の VisualGraphData の両方を生成します。
 */
export const parseGraphAllData = (
  input: string,
  isDirected: boolean,
  isWeighted: boolean
): { adjList: any[]; visualData: VisualGraphData } => {
  if (isWeighted) {
    const { N, edges } = parseWeightedEdges(input, isDirected);
    const zeroIndexedEdges = to0IndexedWeighted(edges);
    const adjList = buildWeightedAdjacencyList(N, zeroIndexedEdges);
    const visualData = buildVisualGraphData(N, edges, isDirected, isWeighted);
    return { adjList, visualData };
  } else {
    const { N, edges } = parseUnweightedEdges(input, isDirected);
    const zeroIndexedEdges = to0IndexedUnweighted(edges);
    const adjList = buildAdjacencyList(N, zeroIndexedEdges);
    const visualData = buildVisualGraphData(N, edges, isDirected, isWeighted);
    return { adjList, visualData };
  }
};
