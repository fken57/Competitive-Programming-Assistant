import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { GraphNeighbor } from './BFSGraphJsonTransfrom';
import { analyzeRootedTreePath } from './treeResultUtils';

export interface TreeDistanceRawApiResponse {
    tree_dir: number;
    vertex1: number;
    vertex2: number;
}

export function buildTreeDistanceVisualGraphData(adjacentList: GraphNeighbor[][], data: TreeDistanceRawApiResponse | null): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const path = analyzeRootedTreePath(adjacentList, data.vertex1, data.vertex2);
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => {
        const isEndpoint1 = i === data.vertex1;
        const isEndpoint2 = i === data.vertex2;
        
        let labelStr = (i + 1).toString();
        if (isEndpoint1 || isEndpoint2) {
            labelStr = `${i + 1} (端点)`;
        }

        return {
            id: i,
            label: labelStr,
            attributes: {
                isEndpoint: isEndpoint1 || isEndpoint2,
                inDiameterPath: path.pathVertices.has(i),
                depth: path.depths[i] < 0 ? N : path.depths[i],
                orderInLevel: i
            }
        };
    });

    const edges: VisualEdge[] = [];
    const seenEdges = new Set<string>();

    for (let u = 0; u < N; u++) {
        for (const neighbor of adjacentList[u]) {
            const v = typeof neighbor === 'number' ? neighbor : neighbor.to;
            const edgeId = [u, v].sort().join('-');
            if (!seenEdges.has(edgeId)) {
                seenEdges.add(edgeId);
                const visualEdge: VisualEdge = {
                    source: u,
                    target: v,
                    attributes: { inDiameterPath: path.pathEdges.has(edgeId) }
                };
                if (typeof neighbor !== 'number' && neighbor.weight !== undefined) {
                    visualEdge.weight = neighbor.weight;
                }
                edges.push(visualEdge);
            }
        }
    }

    return { nodes, edges };
}
