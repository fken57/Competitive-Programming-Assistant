import { useGraph } from '../../features/graph/hooks/useGraph';
import GraphCanvas from '../../features/graph/components/GraphCanvas';
import GraphControlPanel from '../../features/graph/components/GraphControlPanel';

type GraphProps = {
  onBack: () => void;
};

export default function GraphPage({ onBack }: GraphProps) {
  const {
    vertexCount,
    setVertexCount,
    edgeInput,
    setEdgeInput,
    isDirected,
    setIsDirected,
    parsedEdges,
    bfsStart,
    setBfsStart,
    bfsOrder,
    highlightedNodes,
    nodeColors,
    isTree,
    bipartiteStatus,
    diameterResult,
    apiResponse,
    apiEndpoint,
    loading,
    triggerBFS,
    runBipartiteCheck,
    fetchTreeDiameter,
    resetVisuals,
  } = useGraph();

  return (
    <main className="graph-page">
      <header className="graph-page-header">
        <div>
          <p className="page-eyebrow">GRAPH ALGORITHM STUDIO</p>
          <h1>グラフの可視化と解析</h1>
          <p className="page-lead">
            グラフの頂点とエッジを操作し、各種アルゴリズムをインタラクティブに実行して可視化します。
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          ホームへ戻る
        </button>
      </header>

      <div className="graph-layout">
        {/* Left Side: Modular Form Control Panel Component */}
        <GraphControlPanel
          vertexCount={vertexCount}
          setVertexCount={setVertexCount}
          edgeInput={edgeInput}
          setEdgeInput={setEdgeInput}
          isDirected={isDirected}
          setIsDirected={setIsDirected}
          bfsStart={bfsStart}
          setBfsStart={setBfsStart}
          loading={loading}
          isTree={isTree}
          triggerBFS={triggerBFS}
          runBipartiteCheck={runBipartiteCheck}
          fetchTreeDiameter={fetchTreeDiameter}
          resetVisuals={resetVisuals}
        />

        {/* Right Side: Interactive spring-physics Canvas visualizer */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="canvas-panel">
            <div className="canvas-header">
              <div className="canvas-title">
                <span>🎨 グラフキャンバス</span>
              </div>
              <div className="canvas-toolbar">
                <span className="user-badge" style={{ fontSize: '0.8rem' }}>
                  {isTree ? '🌲 木構造検出済' : '📊 汎用グラフ'}
                </span>
              </div>
            </div>

            <GraphCanvas
              vertexCount={vertexCount}
              edges={parsedEdges}
              isDirected={isDirected}
              highlightedNodes={highlightedNodes}
              nodeColors={nodeColors}
              bfsOrder={bfsOrder}
              onClickNode={setBfsStart}
            />
          </div>

          {/* Metrics Status Grid */}
          <div className="metrics-panel">
            <div className="metric-card">
              <h4>二部グラフ判定</h4>
              <div className={`metric-value ${bipartiteStatus.includes('二部グラフです') ? 'highlight' : ''}`}>
                {bipartiteStatus}
              </div>
            </div>

            {isTree && diameterResult && (
              <div className="metric-card">
                <h4>木の直径 (Diameter)</h4>
                <div className="metric-value highlight">{diameterResult.value}</div>
                <div className="metric-details">
                  端点 1: ノード {diameterResult.u}<br />
                  端点 2: ノード {diameterResult.v}
                </div>
              </div>
            )}
          </div>

          {/* API Raw JSON Logger */}
          <div className="control-panel" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                API RESPONSES LOG
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                {apiEndpoint || '/apis/...'}
              </span>
            </div>
            <pre style={{ fontSize: '0.8rem', color: '#a5b4fc', overflowY: 'auto', margin: 0 }}>
              {apiResponse}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}