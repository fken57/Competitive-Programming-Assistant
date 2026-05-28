import { useMemo, useState, type FormEvent } from 'react';
import { API_BASE_URL } from '../../config/api';

type GraphPageProps = {
  onBack: () => void;
};

type ApiTarget =
  | 'unordered'
  | 'ordered'
  | 'bfs'
  | 'isbinarytree'
  | 'treedistance';

type ApiResponseState = {
  status: number;
  body: string;
};

const sampleEdges = `[
  [0, 1],
  [0, 2]
]`;

const sampleNeighbors = `[
  [1, 2],
  [0],
  [0]
]`;

function GraphPage({ onBack }: GraphPageProps) {
  const [target, setTarget] = useState<ApiTarget>('unordered');
  const [vertexCount, setVertexCount] = useState('3');
  const [edges, setEdges] = useState(sampleEdges);
  const [neighbors, setNeighbors] = useState(sampleNeighbors);
  const [startVertex, setStartVertex] = useState('0');
  const [response, setResponse] = useState<ApiResponseState | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(() => {
    switch (target) {
      case 'unordered':
        return '/apis/graphs/unweighted/unordered';
      case 'ordered':
        return '/apis/graphs/unweighted/ordered';
      case 'bfs':
        return '/apis/graphs/unweighted/BFS';
      case 'isbinarytree':
        return '/apis/graphs/unweighted/unordered/isbinarytree';
      case 'treedistance':
        return '/apis/graphs/unweighted/unordered/treedistance';
    }
  }, [target]);

  const requestDescription = useMemo(() => {
    switch (target) {
      case 'unordered':
      case 'ordered':
        return 'vertex_count + edges';
      case 'bfs':
      case 'isbinarytree':
      case 'treedistance':
        return 'vertex_count + neighbors (+ start_vertex for BFS)';
    }
  }, [target]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const payload: Record<string, unknown> = {
        vertex_count: Number(vertexCount),
      };

      if (target === 'unordered' || target === 'ordered') {
        payload.edges = JSON.parse(edges);
      } else {
        payload.neighbors = JSON.parse(neighbors);
        if (target === 'bfs') {
          payload.start_vertex = Number(startVertex);
        }
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      setResponse({ status: res.status, body: text });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="graph-page">
      <section className="graph-shell">
        <header className="graph-header">
          <div>
            <p className="graph-eyebrow">Graph API playground</p>
            <h1>ホームからそのまま試せるグラフ API ページ</h1>
            <p className="graph-lead">
              バックエンドの `/apis/graphs/unweighted/...` をそのまま呼び出して、結果を画面で確認できます。
            </p>
          </div>
          <button className="graph-back" type="button" onClick={onBack}>
            Home に戻る
          </button>
        </header>

        <div className="graph-layout">
          <form className="graph-panel graph-form" onSubmit={handleSubmit}>
            <label className="graph-field">
              <span>API</span>
              <select value={target} onChange={(event) => setTarget(event.target.value as ApiTarget)}>
                <option value="unordered">無向グラフ作成</option>
                <option value="ordered">有向グラフ作成</option>
                <option value="bfs">BFS</option>
                <option value="isbinarytree">二部グラフ / 木判定</option>
                <option value="treedistance">木の直径</option>
              </select>
            </label>

            <label className="graph-field">
              <span>vertex_count</span>
              <input type="number" min="1" value={vertexCount} onChange={(event) => setVertexCount(event.target.value)} />
            </label>

            {(target === 'unordered' || target === 'ordered') && (
              <label className="graph-field graph-field--textarea">
                <span>edges</span>
                <textarea value={edges} onChange={(event) => setEdges(event.target.value)} spellCheck={false} />
              </label>
            )}

            {(target === 'bfs' || target === 'isbinarytree' || target === 'treedistance') && (
              <label className="graph-field graph-field--textarea">
                <span>neighbors</span>
                <textarea value={neighbors} onChange={(event) => setNeighbors(event.target.value)} spellCheck={false} />
              </label>
            )}

            {(target === 'unordered' || target === 'ordered') && (
              <p className="graph-hint">edges は 0-indexed の配列で入力します。</p>
            )}

            {target === 'bfs' && (
              <label className="graph-field">
                <span>start_vertex</span>
                <input type="number" min="0" value={startVertex} onChange={(event) => setStartVertex(event.target.value)} />
              </label>
            )}

            <p className="graph-hint">送信形式: {requestDescription}</p>

            <button className="graph-submit" type="submit" disabled={loading}>
              {loading ? '送信中...' : 'API を呼び出す'}
            </button>

            {error && <p className="graph-error">{error}</p>}
          </form>

          <aside className="graph-panel graph-result">
            <div className="graph-result__header">
              <h2>Response</h2>
              <span>{endpoint}</span>
            </div>
            <pre>{response ? `HTTP ${response.status}\n${response.body}` : 'まだ API は呼ばれていません。'}</pre>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default GraphPage;