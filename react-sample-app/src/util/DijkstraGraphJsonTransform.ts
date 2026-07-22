import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { WeightedEdge } from './CostGraphSendApis';

export interface DijkstraRawApiResponse {
    start_vertex: number;
    distances: number[];
    previous: number[];
}

export function buildDijkstraVisualGraphData(
    adjacentList: WeightedEdge[][],
    data: DijkstraRawApiResponse | null,
    graphType: 'undirected' | 'directed'
): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => {
        const distArray = data.distances || [];
        const dist = distArray[i];
        
        let labelStr = (i + 1).toString();
        if (dist !== undefined && dist !== -1) {
            labelStr = `${i + 1} (d: ${dist})`;
        } else if (dist === -1) {
            labelStr = `${i + 1} (INF)`;
        }

        return {
            id: i,
            label: labelStr,
            isStartNode: i === data.start_vertex,
            attributes: {
                visited: dist !== undefined && dist !== -1
            }
        };
    });

    const edges: VisualEdge[] = [];
    const seenEdges = new Set<string>();
    
    // For directed graphs, we add edges directly
    for (let u = 0; u < N; u++) {
        for (const neighbor of adjacentList[u]) {
            const v = neighbor.to;
            const edgeId = graphType === 'directed'
                ? `${u}-${v}`
                : [u, v].sort((left, right) => left - right).join('-');
            if (seenEdges.has(edgeId)) continue;
            seenEdges.add(edgeId);
            const visualEdge: VisualEdge = { source: u, target: v, weight: neighbor.weight };
            
            // Highlight the shortest path edges
            if ((data.previous[v] === u || (graphType === 'undirected' && data.previous[u] === v)) && data.distances[v] !== -1) {
                visualEdge.isShortestPath = true; 
            }
            edges.push(visualEdge);
        }
    }

    return { nodes, edges };
}
