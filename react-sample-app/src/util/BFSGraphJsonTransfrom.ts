// To parse this data:
//
//   import { Convert, BFSAfterConvertResponse } from "./file";
//
//   const bFSAfterConvertResponse = Convert.toBFSAfterConvertResponse(json);

export interface BFSAfterConvertResponse {
    start_vertex: number;
    dist: number[];
}

// Converts JSON strings to/from your types
export class Convert {
    public static toBFSAfterConvertResponse(json: string): BFSAfterConvertResponse {
        const parsed = JSON.parse(json);
        return {
            start_vertex: parsed.start_vertex,
            dist: parsed.visited_vertices || []
        };
    }

    public static bFSAfterConvertResponseToJson(value: BFSAfterConvertResponse): string {
        return JSON.stringify({
            start_vertex: value.start_vertex,
            visited_vertices: value.dist
        });
    }
}

export function buildBFSVisualGraphData(adjacentList: any[], data: any): { nodes: any[], edges: any[] } | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const nodes = Array.from({ length: N }, (_, i) => {
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

    const edges: any[] = [];
    const seenEdges = new Set<string>();

    for (let u = 0; u < N; u++) {
        for (const neighbor of adjacentList[u]) {
            const v = typeof neighbor === 'number' ? neighbor : neighbor.to;
            const edgeId = [u, v].sort().join('-');
            if (!seenEdges.has(edgeId)) {
                seenEdges.add(edgeId);
                const visualEdge: any = { source: u, target: v };
                if (typeof neighbor !== 'number' && neighbor.weight !== undefined) {
                    visualEdge.weight = neighbor.weight;
                }
                edges.push(visualEdge);
            }
        }
    }

    return { nodes, edges };
}
