import { getApiErrorMessage } from './apiResponseUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export type GraphStaticAnalysisResponse = {
  results: Array<{
    id: string;
    status: 'success' | 'skipped' | 'error';
    data?: unknown;
    reason?: string;
  }>;
};

export async function postGraphStaticAnalysis(
  graphType: 'undirected' | 'directed',
  hasWeights: boolean,
  adjacentList: unknown[],
): Promise<GraphStaticAnalysisResponse> {
  if (graphType === 'directed' && hasWeights) {
    throw new Error('有向・重み付きグラフには静的一覧対象がありません。');
  }
  const endpoint = hasWeights
    ? '/graphs/weighted/unordered/analyze'
    : `/graphs/unweighted/${graphType === 'directed' ? 'ordered' : 'unordered'}/analyze`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vertex_count: adjacentList.length,
      neighbors: adjacentList,
    }),
  });
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
  return response.json();
}
