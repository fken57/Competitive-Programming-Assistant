// To parse this data:
//
//   import { Convert, BFSAfterConvertResponse } from "./file";
//
//   const bFSAfterConvertResponse = Convert.toBFSAfterConvertResponse(json);

import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';


export interface BFSRawApiResponse {
    start_vertex: number;
    visited_vertices: number[];
}

export type GraphNeighbor = number | { to: number; weight?: number };

export function buildBFSVisualGraphData(
    adjacentList: GraphNeighbor[][],
    data: BFSRawApiResponse | null,
    graphType: 'undirected' | 'directed' = 'undirected'
): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => {
        const distArray = data.visited_vertices || []; // バックエンドからは visited_vertices という名前で距離配列が返ってくる
        const dist = distArray[i];
        
        let labelStr = (i + 1).toString();
        if (dist !== undefined && dist !== -1) {
            labelStr = `${i + 1} (d: ${dist})`;
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

    for (let u = 0; u < N; u++) {
        for (const neighbor of adjacentList[u]) {
            const v = typeof neighbor === 'number' ? neighbor : neighbor.to;
            const edgeId = graphType === 'directed'
                ? `${u}-${v}`
                : [u, v].sort((left, right) => left - right).join('-');
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
