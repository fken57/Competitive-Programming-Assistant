import { useState, useMemo, useEffect } from 'react';
import GraphCanvas, { CanvasEdge } from '../../features/graph/components/GraphCanvas';
import { checkBipartite, computeSCC, LcaSolver, DoublingSolver } from '../../features/graph/utils/graphAlgorithms';
import { API_BASE_URL } from '../../config/api';

type GraphProps = {
  onBack: () => void;
};

export default function GraphPage({ onBack }: GraphProps) {
  // Topology State
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [isFunctional, setIsFunctional] = useState(false);

  // Manual input state
  const [vertexCount, setVertexCount] = useState(5);
  const [edgeInput, setEdgeInput] = useState("0 1\n0 2\n1 3\n1 4");

  // Algorithm states
  const [bfsStart, setBfsStart] = useState(0);
  const [bfsOrder, setBfsOrder] = useState<number[]>([]);
  
  const [lcaNodeA, setLcaNodeA] = useState(0);
  const [lcaNodeB, setLcaNodeB] = useState(0);
  const [lcaResult, setLcaResult] = useState<number | null>(null);

  const [doublingStart, setDoublingStart] = useState(0);
  const [doublingSteps, setDoublingSteps] = useState(5);
  const [doublingDest, setDoublingDest] = useState<number | null>(null);

  // Highlighting states for the Canvas
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [nodeColors, setNodeColors] = useState<Map<number, string>>(new Map());

  // API logs
  const [apiResponse, setApiResponse] = useState<string>('まだ API は呼ばれていません。');
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Structural check states
  const [isTree, setIsTree] = useState(false);
  const [diameterResult, setDiameterResult] = useState<{ value: number; u: number; v: number } | null>(null);
  const [bipartiteStatus, setBipartiteStatus] = useState<string>('未判定');

  // --- PARSE EDGES FROM INPUT TEXTAREA ---
  const parsedEdges = useMemo<CanvasEdge[]>(() => {
    const lines = edgeInput.split('\n');
    const edges: CanvasEdge[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/).map(Number);
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) continue;

      const [u, v] = parts;
      const weight = isWeighted ? (parts[2] !== undefined ? parts[2] : 1) : undefined;

      // Prevent redundant canvas render paths for undirected graphs
      const key = isDirected ? `${u}-${v}` : [u, v].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);

      edges.push({ from: u, to: v, weight });
    }
    return edges;
  }, [edgeInput, isWeighted, isDirected]);

  // Build Adjacency List for frontend computations
  const adjList = useMemo<number[][]>(() => {
    const adj: number[][] = Array.from({ length: vertexCount }, () => []);
    for (const edge of parsedEdges) {
      if (edge.from >= vertexCount || edge.to >= vertexCount || edge.from < 0 || edge.to < 0) continue;
      adj[edge.from].push(edge.to);
      if (!isDirected) {
        adj[edge.to].push(edge.from);
      }
    }
    return adj;
  }, [parsedEdges, vertexCount, isDirected]);

  // Handle Functional Graph restrictions (outdegree = 1)
  useEffect(() => {
    if (isFunctional) {
      setIsDirected(true);
      setIsWeighted(false);
      // Auto generate a simple functional loop successor configuration if desired
      const sampleSuccessors = [];
      for (let i = 0; i < vertexCount; i++) {
        sampleSuccessors.push(`${i} ${(i + 1) % vertexCount}`);
      }
      setEdgeInput(sampleSuccessors.join('\n'));
    }
  }, [isFunctional, vertexCount]);

  // Reset highlight configurations when layout inputs change
  const resetVisuals = () => {
    setHighlightedNodes(new Set());
    setHighlightedEdges(new Set());
    setNodeColors(new Map());
    setBfsOrder([]);
    setLcaResult(null);
    setDoublingDest(null);
  };

  useEffect(() => {
    resetVisuals();
    checkSimpleTreeProperty();
  }, [edgeInput, vertexCount, isDirected]);

  // --- TREE DETECTOR AND FRONTEND FALLBACK ---
  const checkSimpleTreeProperty = () => {
    // A tree must be undirected, connected, and contain exactly V-1 edges
    if (isDirected) {
      setIsTree(false);
      return;
    }

    if (parsedEdges.length !== vertexCount - 1) {
      setIsTree(false);
      return;
    }

    // Check connectedness using simple DFS
    const visited = new Array<boolean>(vertexCount).fill(false);
    let count = 0;

    const dfs = (u: number) => {
      visited[u] = true;
      count++;
      for (const v of adjList[u] || []) {
        if (!visited[v]) dfs(v);
      }
    };

    if (vertexCount > 0) dfs(0);
    setIsTree(count === vertexCount);
  };

  // --- LCA ALGORITHM SOLVER ---
  const runLca = () => {
    if (!isTree) {
      alert("LCA (最小共通祖先) は『木』構造でのみ有効です。");
      return;
    }
    if (lcaNodeA >= vertexCount || lcaNodeB >= vertexCount) {
      alert("有効なノードインデックスを選択してください。");
      return;
    }

    const solver = new LcaSolver(vertexCount, adjList, 0);
    const lca = solver.getLca(lcaNodeA, lcaNodeB);
    const path = solver.getPath(lcaNodeA, lcaNodeB);

    setLcaResult(lca);

    // Color path nodes
    const hNodes = new Set<number>(path);
    hNodes.add(lca);
    setHighlightedNodes(hNodes);

    // Highlight path edges
    const hEdges = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      hEdges.add(`${path[i]}-${path[i+1]}`);
      hEdges.add(`${path[i+1]}-${path[i]}`);
    }
    setHighlightedEdges(hEdges);

    // Color LCA node uniquely (Amber)
    const customColors = new Map<number, string>();
    customColors.set(lca, '#fbbf24');
    setNodeColors(customColors);
  };

  // --- FUNCTIONAL GRAPH DOUBLING SOLVER ---
  const runDoubling = () => {
    if (!isDirected) {
      alert("ダブリングは有向Functional Graphでのみ有効です。");
      return;
    }

    // Every node must have exactly outdegree = 1
    const successors = new Array<number>(vertexCount).fill(-1);
    for (const edge of parsedEdges) {
      if (edge.from < vertexCount) {
        successors[edge.from] = edge.to;
      }
    }

    // Check outdegree requirement
    if (successors.some(s => s === -1)) {
      alert("すべてのノードからちょうど1つの有向エッジが出ている必要があります。(Functional Graph)");
      return;
    }

    const solver = new DoublingSolver(successors);
    const { destination, path } = solver.query(doublingStart, doublingSteps);

    setDoublingDest(destination);

    // Highlight all visited hops
    setHighlightedNodes(new Set(path));

    const hEdges = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      hEdges.add(`${path[i]}-${path[i+1]}`);
    }
    setHighlightedEdges(hEdges);

    const colors = new Map<number, string>();
    colors.set(doublingStart, '#2dd4bf'); // Start
    colors.set(destination, '#fbbf24');   // Destination
    setNodeColors(colors);
  };

  // --- BIPARTITE COLORING ---
  const runBipartiteCheck = () => {
    const { isBipartite, group1, group2 } = checkBipartite(vertexCount, adjList);
    
    if (isBipartite) {
      setBipartiteStatus('二部グラフです');
      
      const colors = new Map<number, string>();
      // Paint group 1 Pink, group 2 Indigo
      group1.forEach(u => colors.set(u, '#f43f5e'));
      group2.forEach(u => colors.set(u, '#6366f1'));
      setNodeColors(colors);
    } else {
      setBipartiteStatus('二部グラフではありません');
      setNodeColors(new Map());
      alert('奇数サイクルが存在するため、二部グラフではありません！');
    }
  };

  // --- TARJAN strongly CONNECTED COMPONENTS ---
  const runSCC = () => {
    if (!isDirected) {
      alert("強連結成分分解(SCC)は有向グラフのみ有効です。");
      return;
    }

    const components = computeSCC(vertexCount, adjList);
    const colors = new Map<number, string>();

    // harmonized palette for SCC components
    const palette = ['#2dd4bf', '#6366f1', '#fbbf24', '#f43f5e', '#ec4899', '#10b981', '#a855f7'];

    components.forEach((component, compIdx) => {
      const color = palette[compIdx % palette.length];
      component.forEach(nodeId => {
        colors.set(nodeId, color);
      });
    });

    setNodeColors(colors);
    alert(`強連結成分を検出しました: 合計 ${components.length} 個のグループに分解されました。`);
  };

  // --- BACKEND API BFS CALULATION ---
  const triggerBFS = async () => {
    setLoading(true);
    setBfsOrder([]);
    setApiResponse('API リクエスト送信中...');
    
    try {
      // API expects start_vertex + vertex_count + neighbors list
      const payload = {
        vertex_count: Number(vertexCount),
        neighbors: adjList,
        start_vertex: Number(bfsStart),
      };

      setApiEndpoint('/apis/graphs/unweighted/BFS');
      const response = await fetch(`${API_BASE_URL}/apis/graphs/unweighted/BFS`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (response.ok && data.visited_vertices) {
        setBfsOrder(data.visited_vertices);
        // Highlight traversed nodes
        setHighlightedNodes(new Set(data.visited_vertices));
      }
    } catch (e) {
      setApiResponse(e instanceof Error ? e.message : 'API connection error');
    } finally {
      setLoading(false);
    }
  };

  // --- BACKEND API TREE DIAMETER CALCULATION ---
  const fetchTreeDiameter = async () => {
    if (!isTree) {
      alert("直径の計算は『木』構造でのみ有効です。");
      return;
    }
    
    setLoading(true);
    setApiResponse('木の直径を API サーバーで計算中...');
    
    try {
      const payload = {
        vertex_count: Number(vertexCount),
        neighbors: adjList,
      };

      setApiEndpoint('/apis/graphs/unweighted/unordered/treedistance');
      const response = await fetch(`${API_BASE_URL}/apis/graphs/unweighted/unordered/treedistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (response.ok && data.tree_dir !== undefined) {
        setDiameterResult({
          value: data.tree_dir,
          u: data.vertex1,
          v: data.vertex2,
        });

        // Highlight endpoints
        const endpoints = new Set<number>([data.vertex1, data.vertex2]);
        setHighlightedNodes(endpoints);
      }
    } catch (e) {
      setApiResponse(e instanceof Error ? e.message : 'API connection error');
    } finally {
      setLoading(false);
    }
  };

  // Interactive node click selection handler
  const handleNodeClick = (nodeId: number) => {
    if (isTree) {
      // Toggle LCA selection
      if (lcaNodeA === nodeId) return;
      setLcaNodeB(lcaNodeA);
      setLcaNodeA(nodeId);
    } else if (isFunctional) {
      setDoublingStart(nodeId);
    } else {
      setBfsStart(nodeId);
    }
  };

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
        <button className="btn btn-secondary" onClick={onBack}>
          ホームへ戻る
        </button>
      </header>

      <div className="graph-layout">
        {/* Left Side: Operations Controls */}
        <section className="control-panel">
          <div className="control-section">
            <h3>トポロジー設定</h3>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${!isDirected ? 'active' : ''}`}
                onClick={() => {
                  setIsDirected(false);
                  setIsFunctional(false);
                }}
              >
                無向グラフ
              </button>
              <button
                className={`toggle-btn ${isDirected && !isFunctional ? 'active' : ''}`}
                onClick={() => {
                  setIsDirected(true);
                  setIsFunctional(false);
                }}
              >
                有向グラフ
              </button>
            </div>
            
            <div className="toggle-group" style={{ marginTop: '8px' }}>
              <button
                className={`toggle-btn ${isWeighted ? 'active' : ''}`}
                onClick={() => {
                  setIsWeighted(true);
                  setIsFunctional(false);
                }}
              >
                重みあり
              </button>
              <button
                className={`toggle-btn ${isFunctional ? 'active' : ''}`}
                onClick={() => {
                  setIsFunctional(true);
                  setIsDirected(true);
                  setIsWeighted(false);
                }}
              >
                Functional
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>グラフ入力</h3>
            <div className="form-field">
              <label htmlFor="vertex-count">頂点数 (V)</label>
              <input
                id="vertex-count"
                type="number"
                min="1"
                max="50"
                value={vertexCount}
                onChange={(e) => setVertexCount(Math.max(1, Number(e.target.value)))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edge-list">エッジリスト (u v {isWeighted ? 'w' : ''})</label>
              <textarea
                id="edge-list"
                value={edgeInput}
                onChange={(e) => setEdgeInput(e.target.value)}
                placeholder={isWeighted ? "0 1 5\n0 2 10" : "0 1\n0 2"}
                spellCheck="false"
              />
            </div>
            <p className="panel-hint">
              ※ 0-indexed で入力してください。1行に1つのエッジを指定します。
            </p>
          </div>

          <div className="control-section">
            <h3>アルゴリズム実行</h3>

            {/* Bfs execution */}
            <div className="form-field">
              <label>BFS (幅優先探索)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max={vertexCount - 1}
                  value={bfsStart}
                  onChange={(e) => setBfsStart(Number(e.target.value))}
                  style={{ width: '80px' }}
                />
                <button className="btn btn-primary" onClick={triggerBFS} style={{ flex: 1 }} disabled={loading}>
                  BFS 実行
                </button>
              </div>
            </div>

            {/* Tree operations */}
            {isTree && (
              <>
                <div className="form-field" style={{ marginTop: '10px' }}>
                  <label>LCA (最小共通祖先)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select value={lcaNodeA} onChange={(e) => setLcaNodeA(Number(e.target.value))}>
                      {Array.from({ length: vertexCount }).map((_, i) => (
                        <option key={i} value={i}>Node {i}</option>
                      ))}
                    </select>
                    <span>と</span>
                    <select value={lcaNodeB} onChange={(e) => setLcaNodeB(Number(e.target.value))}>
                      {Array.from({ length: vertexCount }).map((_, i) => (
                        <option key={i} value={i}>Node {i}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-secondary" onClick={runLca} style={{ marginTop: '8px' }}>
                    LCA 検出
                  </button>
                </div>

                <button className="btn btn-secondary" onClick={fetchTreeDiameter} style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                  木の直径を計算 (API)
                </button>
              </>
            )}

            {/* Functional Graph Doubling */}
            {isFunctional && (
              <div className="form-field" style={{ marginTop: '10px' }}>
                <label>ダブリング (2^k 遷移)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select value={doublingStart} onChange={(e) => setDoublingStart(Number(e.target.value))}>
                    {Array.from({ length: vertexCount }).map((_, i) => (
                      <option key={i} value={i}>起: {i}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={doublingSteps}
                    onChange={(e) => setDoublingSteps(Math.max(1, Number(e.target.value)))}
                    placeholder="ステップ数 K"
                    style={{ flex: 1 }}
                  />
                </div>
                <button className="btn btn-primary" onClick={runDoubling} style={{ marginTop: '8px' }}>
                  ダブリング追跡
                </button>
              </div>
            )}

            {/* Undirected Bipartite Check */}
            {!isDirected && (
              <button className="btn btn-secondary" onClick={runBipartiteCheck} style={{ width: '100%', marginTop: '10px' }}>
                二部グラフ判定
              </button>
            )}

            {/* Directed Strongly Connected Components */}
            {isDirected && (
              <button className="btn btn-secondary" onClick={runSCC} style={{ width: '100%', marginTop: '10px' }}>
                強連結成分 (SCC) 分解
              </button>
            )}

            <button className="btn btn-secondary" onClick={resetVisuals} style={{ width: '100%', marginTop: '12px' }}>
              ハイライト初期化
            </button>
          </div>
        </section>

        {/* Right Side: Interactive Visualizer & API metrics */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="canvas-panel">
            <div className="canvas-header">
              <div className="canvas-title">
                <span>🎨 グラフキャンバス</span>
              </div>
              <div className="canvas-toolbar">
                <span className="user-badge" style={{ fontSize: '0.8rem' }}>
                  {isTree ? '🌲 木構造検出済' : isFunctional ? '⚙️ Functional Graph' : '📊 汎用グラフ'}
                </span>
              </div>
            </div>
            
            <GraphCanvas
              vertexCount={vertexCount}
              edges={parsedEdges}
              isDirected={isDirected}
              isWeighted={isWeighted}
              highlightedNodes={highlightedNodes}
              highlightedEdges={highlightedEdges}
              nodeColors={nodeColors}
              bfsOrder={bfsOrder}
              onClickNode={handleNodeClick}
            />
          </div>

          {/* Metrics Dashboard */}
          <div className="metrics-panel">
            <div className="metric-card">
              <h4>二部グラフ判定</h4>
              <div className={`metric-value ${bipartiteStatus.includes('二部') ? 'highlight' : ''}`}>
                {bipartiteStatus}
              </div>
            </div>

            {isTree && diameterResult && (
              <div className="metric-card">
                <h4>木の直径</h4>
                <div className="metric-value highlight">{diameterResult.value}</div>
                <div className="metric-details">
                  端点 1: ノード {diameterResult.u}<br />
                  端点 2: ノード {diameterResult.v}
                </div>
              </div>
            )}

            {lcaResult !== null && (
              <div className="metric-card">
                <h4>LCA 結果</h4>
                <div className="metric-value highlight">ノード {lcaResult}</div>
                <div className="metric-details">
                  選択ノード: {lcaNodeA} と {lcaNodeB}
                </div>
              </div>
            )}

            {doublingDest !== null && (
              <div className="metric-card">
                <h4>ダブリング結果</h4>
                <div className="metric-value highlight">ノード {doublingDest}</div>
                <div className="metric-details">
                  {doublingStart} から {doublingSteps} 歩移動した結果
                </div>
              </div>
            )}
          </div>

          {/* API Log details */}
          <div className="control-panel" style={{ maxHeight: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                API RESPONSES LOG
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                {apiEndpoint || '/apis/...'}
              </span>
            </div>
            <pre style={{ fontSize: '0.8rem', color: '#a5b4fc', overflowY: 'auto' }}>
              {apiResponse}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}