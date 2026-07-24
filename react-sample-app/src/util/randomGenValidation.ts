export const MAX_RANDOM_GEN_N = 200_000;
export const MAX_RANDOM_GEN_M = 500_000;

export function maximumSimpleGraphEdges(
  n: number,
  directed: boolean,
  allowSelfLoop: boolean,
): number {
  if (directed) return allowSelfLoop ? n * n : n * (n - 1);
  return allowSelfLoop ? n * (n + 1) / 2 : n * (n - 1) / 2;
}

export function validateGraphSettings(settings: {
  n: number;
  m: number;
  graphType: string;
  directed: boolean;
  connected: boolean;
  allowSelfLoop: boolean;
  allowMultiEdge: boolean;
}): string | null {
  const { n, m, graphType, directed, connected, allowSelfLoop, allowMultiEdge } = settings;
  if (!Number.isInteger(n) || n < 1 || n > MAX_RANDOM_GEN_N) {
    return `Nは1から${MAX_RANDOM_GEN_N}の整数にしてください`;
  }
  if (!Number.isInteger(m) || m < 0 || m > MAX_RANDOM_GEN_M) {
    return `Mは0から${MAX_RANDOM_GEN_M}の整数にしてください`;
  }
  if (graphType === 'tree'
    && (directed || !connected || allowSelfLoop || allowMultiEdge || m !== n - 1)) {
    return 'treeは無向・連結・自己ループなし・多重辺なし・M=N-1にしてください';
  }
  if (graphType === 'dag' && (!directed || allowSelfLoop)) {
    return 'dagは有向・自己ループなしにしてください';
  }
  if (graphType === 'disconnected' && connected) {
    return 'disconnectedではconnectedを無効にしてください';
  }
  if (connected && m < n - 1) {
    return '連結グラフにはM >= N-1が必要です';
  }
  if (!allowMultiEdge) {
    let maximum = maximumSimpleGraphEdges(n, directed, allowSelfLoop);
    if (graphType === 'dag') maximum = n * (n - 1) / 2;
    if (graphType === 'disconnected') {
      const left = Math.floor(n / 2);
      const right = n - left;
      maximum = maximumSimpleGraphEdges(left, directed, allowSelfLoop)
        + maximumSimpleGraphEdges(right, directed, allowSelfLoop);
    }
    if (m > maximum) return `この設定では最大 M は ${maximum} です`;
  }
  return null;
}

export function createRandomSeed(): string {
  const values = new Uint32Array(2);
  crypto.getRandomValues(values);
  return (BigInt(values[0]) * BigInt(4_294_967_296) + BigInt(values[1])).toString();
}
