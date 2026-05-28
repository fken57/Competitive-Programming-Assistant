/**
 * Graph algorithm utility module for Competitive Programming Assistant.
 * Provides client-side execution of advanced graph queries for immediate visual feedback.
 */

// --- BIPARTITE GRAPH COLORING ---
export type BipartiteResult = {
  isBipartite: boolean;
  group1: number[];
  group2: number[];
};

export function checkBipartite(vertexCount: number, adj: number[][]): BipartiteResult {
  const colors = new Array<number>(vertexCount).fill(-1);
  const group1: number[] = [];
  const group2: number[] = [];

  for (let start = 0; start < vertexCount; start++) {
    if (colors[start] !== -1) continue;

    const queue: number[] = [start];
    colors[start] = 0;
    group1.push(start);

    while (queue.length > 0) {
      const u = queue.shift()!;
      const currColor = colors[u];
      const nextColor = 1 - currColor;

      for (const v of adj[u] || []) {
        if (colors[v] === -1) {
          colors[v] = nextColor;
          if (nextColor === 0) group1.push(v);
          else group2.push(v);
          queue.push(v);
        } else if (colors[v] === currColor) {
          return { isBipartite: false, group1: [], group2: [] };
        }
      }
    }
  }

  return { isBipartite: true, group1, group2 };
}

// --- STRONGLY CONNECTED COMPONENTS (TARJAN'S) ---
export function computeSCC(vertexCount: number, adj: number[][]): number[][] {
  let index = 0;
  const indices = new Array<number>(vertexCount).fill(-1);
  const lowlink = new Array<number>(vertexCount).fill(-1);
  const onStack = new Array<boolean>(vertexCount).fill(false);
  const stack: number[] = [];
  const components: number[][] = [];

  function strongconnect(u: number) {
    indices[u] = index;
    lowlink[u] = index;
    index++;
    stack.push(u);
    onStack[u] = true;

    for (const v of adj[u] || []) {
      if (indices[v] === -1) {
        strongconnect(v);
        lowlink[u] = Math.min(lowlink[u], lowlink[v]);
      } else if (onStack[v]) {
        lowlink[u] = Math.min(lowlink[u], indices[v]);
      }
    }

    if (lowlink[u] === indices[u]) {
      const component: number[] = [];
      let w = -1;
      do {
        w = stack.pop()!;
        onStack[w] = false;
        component.push(w);
      } while (w !== u);
      components.push(component);
    }
  }

  for (let i = 0; i < vertexCount; i++) {
    if (indices[i] === -1) {
      strongconnect(i);
    }
  }

  return components;
}

// --- LOWEST COMMON ANCESTOR (LCA) VIA BINARY LIFTING ---
export class LcaSolver {
  private depth: number[];
  private up: number[][];
  private maxLog: number;
  private adj: number[][];
  private vertexCount: number;

  constructor(vertexCount: number, adj: number[][], root = 0) {
    this.vertexCount = vertexCount;
    this.adj = adj;
    this.maxLog = Math.floor(Math.log2(Math.max(1, vertexCount))) + 2;
    this.depth = new Array<number>(vertexCount).fill(0);
    this.up = Array.from({ length: vertexCount }, () => new Array<number>(this.maxLog).fill(0));

    if (vertexCount > 0) {
      this.dfs(root, root);
    }
  }

  private dfs(u: number, p: number, d = 0) {
    this.depth[u] = d;
    this.up[u][0] = p;

    for (let i = 1; i < this.maxLog; i++) {
      this.up[u][i] = this.up[this.up[u][i - 1]][i - 1];
    }

    for (const v of this.adj[u] || []) {
      if (v !== p) {
        this.dfs(v, u, d + 1);
      }
    }
  }

  public getLca(u: number, v: number): number {
    if (this.depth[u] < this.depth[v]) {
      const tmp = u; u = v; v = tmp;
    }

    // Lift u to the same depth as v
    const diff = this.depth[u] - this.depth[v];
    for (let i = 0; i < this.maxLog; i++) {
      if ((diff >> i) & 1) {
        u = this.up[u][i];
      }
    }

    if (u === v) return u;

    // Lift both u and v until they have the same parent
    for (let i = this.maxLog - 1; i >= 0; i--) {
      if (this.up[u][i] !== this.up[v][i]) {
        u = this.up[u][i];
        v = this.up[v][i];
      }
    }

    return this.up[u][0];
  }

  /**
   * Finds the path from start to end (via LCA) to highlight visually.
   */
  public getPath(start: number, end: number): number[] {
    const lca = this.getLca(start, end);
    const leftPath: number[] = [];
    const rightPath: number[] = [];

    // Go up from start to LCA
    let curr = start;
    while (curr !== lca) {
      leftPath.push(curr);
      curr = this.up[curr][0];
    }
    leftPath.push(lca);

    // Go up from end to LCA
    curr = end;
    while (curr !== lca) {
      rightPath.push(curr);
      curr = this.up[curr][0];
    }
    rightPath.reverse();

    return [...leftPath, ...rightPath];
  }
}

// --- FUNCTIONAL GRAPH DOUBLING ---
export class DoublingSolver {
  private nextTable: number[][]; // dp[k][i] represents node reached from i after 2^k steps
  private maxLog = 30; // 2^30 steps covers virtually any competitive programming query K
  private successors: number[];

  constructor(successors: number[]) {
    this.successors = successors;
    const n = successors.length;
    this.nextTable = Array.from({ length: this.maxLog }, () => new Array<number>(n).fill(0));

    // Base case: 2^0 steps
    for (let i = 0; i < n; i++) {
      this.nextTable[0][i] = successors[i] < n && successors[i] >= 0 ? successors[i] : i;
    }

    // DP transitions: dp[k][i] = dp[k-1][dp[k-1][i]]
    for (let k = 1; k < this.maxLog; k++) {
      for (let i = 0; i < n; i++) {
        const prev = this.nextTable[k - 1][i];
        this.nextTable[k][i] = this.nextTable[k - 1][prev];
      }
    }
  }

  /**
   * Computes the final target node after K steps, and returns the hop-by-hop visual path.
   */
  public query(startNode: number, steps: number): { destination: number; path: number[] } {
    const path: number[] = [startNode];
    let curr = startNode;
    let remainingSteps = steps;

    for (let k = 0; k < this.maxLog; k++) {
      if ((remainingSteps >> k) & 1) {
        curr = this.nextTable[k][curr];
        path.push(curr);
      }
    }

    return { destination: curr, path };
  }
}
