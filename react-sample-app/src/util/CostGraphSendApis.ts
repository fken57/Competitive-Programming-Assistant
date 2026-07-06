const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export interface WeightedEdge {
    to: number;
    weight: number;
}

export interface CostGraphNeighborListRequest {
    vertex_count: number;
    neighbors: WeightedEdge[][];
    start_vertex?: number; // 省略可能
}

export const WEIGHTED_GRAPH_ENDPOINTS = {
    DIJKSTRA: '/graphs/weighted/ordered/dijkstra'
} as const;

export type WeightedGraphEndpoint = typeof WEIGHTED_GRAPH_ENDPOINTS[keyof typeof WEIGHTED_GRAPH_ENDPOINTS];

export const postWeightedGraph = async <TResponse = any>(
    endpoint: WeightedGraphEndpoint | string,
    payload : CostGraphNeighborListRequest
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
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
