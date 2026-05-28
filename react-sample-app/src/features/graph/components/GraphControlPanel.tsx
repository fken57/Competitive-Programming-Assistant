type GraphControlPanelProps = {
  vertexCount: number;
  setVertexCount: (count: number) => void;
  edgeInput: string;
  setEdgeInput: (input: string) => void;
  isDirected: boolean;
  setIsDirected: (isDir: boolean) => void;
  bfsStart: number;
  setBfsStart: (start: number) => void;
  loading: boolean;
  isTree: boolean;
  triggerBFS: () => void;
  runBipartiteCheck: () => void;
  fetchTreeDiameter: () => void;
  resetVisuals: () => void;
};

export default function GraphControlPanel({
  vertexCount,
  setVertexCount,
  edgeInput,
  setEdgeInput,
  isDirected,
  setIsDirected,
  bfsStart,
  setBfsStart,
  loading,
  isTree,
  triggerBFS,
  runBipartiteCheck,
  fetchTreeDiameter,
  resetVisuals,
}: GraphControlPanelProps) {
  return (
    <section className="control-panel">
      {/* Topology Config */}
      <div className="control-section">
        <h3>トポロジー設定</h3>
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${!isDirected ? 'active' : ''}`}
            onClick={() => setIsDirected(false)}
          >
            無向グラフ
          </button>
          <button
            type="button"
            className={`toggle-btn ${isDirected ? 'active' : ''}`}
            onClick={() => setIsDirected(true)}
          >
            有向グラフ
          </button>
        </div>
      </div>

      {/* Manual Adjacency Input */}
      <div className="control-section">
        <h3>グラフ入力</h3>
        <div className="form-field">
          <label htmlFor="vertex-count">頂点数 (V)</label>
          <input
            id="vertex-count"
            type="number"
            min="1"
            max="40"
            value={vertexCount}
            onChange={(e) => setVertexCount(Math.max(1, Number(e.target.value)))}
          />
        </div>

        <div className="form-field">
          <label htmlFor="edge-list">エッジリスト (u v)</label>
          <textarea
            id="edge-list"
            value={edgeInput}
            onChange={(e) => setEdgeInput(e.target.value)}
            placeholder="0 1\n0 2"
            spellCheck="false"
          />
        </div>
        <p className="panel-hint">
          ※ 0-indexed（0始まりの整数インデックス）で入力してください。エッジごとに改行します。
        </p>
      </div>

      {/* API Algorithm Executions */}
      <div className="control-section">
        <h3>アルゴリズム実行 (Go API)</h3>

        {/* BFS controls */}
        <div className="form-field">
          <label htmlFor="bfs-start-node">BFS (幅優先探索) 開始ノード</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="bfs-start-node"
              type="number"
              min="0"
              max={vertexCount - 1}
              value={bfsStart}
              onChange={(e) => setBfsStart(Number(e.target.value))}
              style={{ width: '80px' }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={triggerBFS}
              style={{ flex: 1 }}
              disabled={loading}
            >
              BFS 実行
            </button>
          </div>
        </div>

        {/* Bipartite check (only valid for undirected) */}
        {!isDirected && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={runBipartiteCheck}
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            二部グラフ判定 (API)
          </button>
        )}

        {/* Tree diameter check (only valid for trees) */}
        {isTree && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchTreeDiameter}
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            木の直径を計算 (API)
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={resetVisuals}
          style={{ width: '100%', marginTop: '12px' }}
        >
          ハイライト初期化
        </button>
      </div>
    </section>
  );
}
