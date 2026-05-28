import { useState, useMemo, useEffect } from 'react';
import { parseEdgeInput, buildAdjacencyList, ParsedEdge } from '../utils/graphParser';
import { API_BASE_URL } from '../../../config/api';

export type TreeDiameter = {
  value: number;
  u: number;
  v: number;
};

export function useGraph() {
  // Topology inputs
  const [vertexCount, setVertexCount] = useState(5);
  const [edgeInput, setEdgeInput] = useState("0 1\n0 2\n1 3\n1 4");
  const [isDirected, setIsDirected] = useState(false);

  // Highlighting state for visualizer
  const [bfsStart, setBfsStart] = useState(0);
  const [bfsOrder, setBfsOrder] = useState<number[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
  const [nodeColors, setNodeColors] = useState<Map<number, string>>(new Map());

  // Structural metadata states
  const [isTree, setIsTree] = useState(false);
  const [bipartiteStatus, setBipartiteStatus] = useState<string>('未判定');
  const [diameterResult, setDiameterResult] = useState<TreeDiameter | null>(null);

  // Network logs
  const [apiResponse, setApiResponse] = useState<string>('まだ API は呼ばれていません。');
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // --- DERIVED PROPERTIES ---
  const parsedEdges = useMemo<ParsedEdge[]>(() => {
    return parseEdgeInput(edgeInput, isDirected);
  }, [edgeInput, isDirected]);

  const adjList = useMemo<number[][]>(() => {
    return buildAdjacencyList(vertexCount, parsedEdges, isDirected);
  }, [parsedEdges, vertexCount, isDirected]);

  // Reset visual colors/selections
  const resetVisuals = () => {
    setHighlightedNodes(new Set());
    setNodeColors(new Map());
    setBfsOrder([]);
    setBipartiteStatus('未判定');
    setDiameterResult(null);
    setApiResponse('ハイライトが初期化されました。');
    setApiEndpoint('');
  };

  // Run a quick DFS connectedness tree check on change
  useEffect(() => {
    resetVisuals();
    checkSimpleTreeProperty();
  }, [edgeInput, vertexCount, isDirected]);

  const checkSimpleTreeProperty = () => {
    if (isDirected) {
      setIsTree(false);
      return;
    }

    if (parsedEdges.length !== vertexCount - 1) {
      setIsTree(false);
      return;
    }

    // Undirected, V-1 edges: Check connectedness
    const visited = new Array<boolean>(vertexCount).fill(false);
    let visitedCount = 0;

    const dfs = (u: number) => {
      visited[u] = true;
      visitedCount++;
      for (const v of adjList[u] || []) {
        if (!visited[v]) dfs(v);
      }
    };

    if (vertexCount > 0) dfs(0);
    setIsTree(visitedCount === vertexCount);
  };

  // --- API TRIGGER: BFS ---
  const triggerBFS = async () => {
    if (bfsStart >= vertexCount || bfsStart < 0) {
      alert(`開始頂点には 0 から ${vertexCount - 1} の範囲の整数を指定してください。`);
      return;
    }

    setLoading(true);
    setBfsOrder([]);
    setApiResponse('API リクエスト送信中...');
    setApiEndpoint('/apis/graphs/unweighted/BFS');

    try {
      const payload = {
        vertex_count: Number(vertexCount),
        neighbors: adjList,
        start_vertex: Number(bfsStart),
      };

      const res = await fetch(`${API_BASE_URL}/apis/graphs/unweighted/BFS`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (res.ok && data.visited_vertices) {
        setBfsOrder(data.visited_vertices);
        setHighlightedNodes(new Set(data.visited_vertices));
      }
    } catch (e) {
      setApiResponse(e instanceof Error ? e.message : 'API connection error');
    } finally {
      setLoading(false);
    }
  };

  // --- API TRIGGER: BIPARTITE CHECK ---
  const runBipartiteCheck = async () => {
    setLoading(true);
    setNodeColors(new Map());
    setBipartiteStatus('判定中...');
    setApiResponse('二部グラフ判定 API を呼び出し中...');
    setApiEndpoint('/apis/graphs/unweighted/unordered/isbinarytree');

    try {
      const payload = {
        vertex_count: Number(vertexCount),
        neighbors: adjList,
      };

      const res = await fetch(`${API_BASE_URL}/apis/graphs/unweighted/unordered/isbinarytree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (res.ok) {
        if (data.is_binary_tree) {
          setBipartiteStatus('二部グラフです');
          
          // Color components Pink and Indigo
          const colors = new Map<number, string>();
          (data.group_one || []).forEach((u: number) => colors.set(u, '#f43f5e'));
          (data.group_two || []).forEach((u: number) => colors.set(u, '#6366f1'));
          setNodeColors(colors);
        } else {
          setBipartiteStatus('二部グラフではありません');
          setNodeColors(new Map());
        }
      } else {
        setBipartiteStatus('判定エラー');
        alert(data.error || '二部グラフ判定でエラーが発生しました。');
      }
    } catch (e) {
      setBipartiteStatus('判定エラー');
      setApiResponse(e instanceof Error ? e.message : 'API connection error');
    } finally {
      setLoading(false);
    }
  };

  // --- API TRIGGER: TREE DIAMETER ---
  const fetchTreeDiameter = async () => {
    if (!isTree) {
      alert("直径の計算は『木』構造でのみ有効です。");
      return;
    }

    setLoading(true);
    setDiameterResult(null);
    setApiResponse('木の直径を API サーバーで計算中...');
    setApiEndpoint('/apis/graphs/unweighted/unordered/treedistance');

    try {
      const payload = {
        vertex_count: Number(vertexCount),
        neighbors: adjList,
      };

      const res = await fetch(`${API_BASE_URL}/apis/graphs/unweighted/unordered/treedistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (res.ok && data.tree_dir !== undefined) {
        setDiameterResult({
          value: data.tree_dir,
          u: data.vertex1,
          v: data.vertex2,
        });

        // Highlight the two diameter endpoints
        const endpoints = new Set<number>([data.vertex1, data.vertex2]);
        setHighlightedNodes(endpoints);

        const colors = new Map<number, string>();
        colors.set(data.vertex1, '#fbbf24');
        colors.set(data.vertex2, '#fbbf24');
        setNodeColors(colors);
      } else {
        alert(data.error || '直径の計算でエラーが発生しました。');
      }
    } catch (e) {
      setApiResponse(e instanceof Error ? e.message : 'API connection error');
    } finally {
      setLoading(false);
    }
  };

  return {
    vertexCount,
    setVertexCount,
    edgeInput,
    setEdgeInput,
    isDirected,
    setIsDirected,
    parsedEdges,
    adjList,
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
  };
}
