import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { GraphNeighbor } from './BFSGraphJsonTransfrom';

export interface IsTreeRawApiResponse {
    is_tree: boolean;
}

export function buildIsTreeVisualGraphData(adjacentList: GraphNeighbor[][], data: IsTreeRawApiResponse | null): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => ({
        id: i,
        label: (i + 1).toString(),
        attributes: {}
    }));

    const edges: VisualEdge[] = [];
    const seenEdges = new Set<string>();

    for (let u = 0; u < N; u++) {
        for (const neighbor of adjacentList[u]) {
            const v = typeof neighbor === 'number' ? neighbor : neighbor.to;
            const edgeId = [u, v].sort().join('-');
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
