import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { GraphNeighbor } from './BFSGraphJsonTransfrom';

export interface TopologicalSortRawApiResponse {
    vertices: number[];
}

export function buildTopologicalSortVisualGraphData(adjacentList: GraphNeighbor[][], data: TopologicalSortRawApiResponse | null): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => {
        let orderIndex = -1;
        if (data.vertices && data.vertices.length > 0) {
            orderIndex = data.vertices.indexOf(i);
        }
        
        let labelStr = (i + 1).toString();
        if (orderIndex !== -1) {
            labelStr = `${i + 1} (${orderIndex + 1}番目)`;
        }

        return {
            id: i,
            label: labelStr,
            attributes: {
                hasOrder: orderIndex !== -1,
                orderIndex: orderIndex
            }
        };
    });

    const edges: VisualEdge[] = [];
    const seenEdges = new Set<string>();

    for (let u = 0; u < N; u++) {
        for (const neighbor of adjacentList[u]) {
            const v = typeof neighbor === 'number' ? neighbor : neighbor.to;
            const edgeId = `${u}->${v}`; // Directed graph, so order matters
            if (!seenEdges.has(edgeId)) {
                seenEdges.add(edgeId);
                const visualEdge: VisualEdge = { source: u, target: v };
                if (typeof neighbor !== 'number' && neighbor.weight !== undefined) {
                    visualEdge.weight = neighbor.weight;
                }
                edges.push(visualEdge);
            }
        }
    }

    return { nodes, edges };
}
