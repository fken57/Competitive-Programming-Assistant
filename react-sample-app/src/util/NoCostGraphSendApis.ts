import { getApiErrorMessage } from './apiResponseUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export interface NoCostGraphNeighborListRequest {
    vertex_count: number;
    neighbors: number[][];
    start_vertex?: number; // 省略可能
}

export interface LCARequest extends NoCostGraphNeighborListRequest {
    root: number;
    queries: [number, number][];
}

export type UnweightedGraphRequest = NoCostGraphNeighborListRequest | LCARequest;

export const GRAPH_ENDPOINTS = {
    IS_BINARY_TREE: '/graphs/unweighted/unordered/isbinarytree',
    IS_TREE: '/graphs/unweighted/unordered/istree',
    TREE_DISTANCE: '/graphs/unweighted/unordered/treedistance',
    TOPOLOGICAL_SORT: '/graphs/unweighted/ordered/topologicalsort',
    BFS: '/graphs/unweighted/BFS',
    SCC: '/graphs/unweighted/ordered/scc',
    DFS: '/graphs/unweighted/dfs',
    CONNECTED_COMPONENTS: '/graphs/unweighted/unordered/connectedcomponents',
    DIRECTED_CYCLE: '/graphs/unweighted/ordered/cycle',
    UNION_FIND: '/graphs/unweighted/unordered/unionfind',
    LOW_LINK: '/graphs/unweighted/unordered/lowlink',
    LCA: '/graphs/unweighted/unordered/lca'
} as const;

export type GraphEndpoint= typeof GRAPH_ENDPOINTS[keyof typeof GRAPH_ENDPOINTS];

export const postUnweightedGraph = async <TResponse = any>(
    endpoint: GraphEndpoint| string,
    payload : UnweightedGraphRequest
): Promise<TResponse> => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    console.log('送信先URL:', fullUrl);
    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
    }
    return response.json();
}
