// To parse this data:
//
//   import { Convert, BFSAfterConvertResponse } from "./file";
//
//   const bFSAfterConvertResponse = Convert.toBFSAfterConvertResponse(json);

import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';






export interface BipartiteRawApiResponse {
    is_binary_tree : boolean;
    group_one: number[];
    group_two: number[];
}

export type GraphNeighbor = number | { to: number; weight?: number };

export function IsBipartiteTree(data: BipartiteRawApiResponse) {
    if(!data) return false;
    return data.is_binary_tree;
}

export function buildBipartiteVisualGraphData(adjacentList: GraphNeighbor[][], data: BipartiteRawApiResponse | null): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => {
        const groupOne = data.group_one?.includes(i) || false;
        const groupTwo = data.group_two?.includes(i) || false;

        let labelStr = (i + 1).toString();
        if (groupOne) {
            labelStr = `${i + 1} (Group 1)`;
        } 
        else if (groupTwo) {
            labelStr = `${i + 1} (Group 2)`;
        }

        return {
            id: i,
            label: labelStr,
            attributes: {
                groupOne: groupOne, 
                groupTwo: groupTwo
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
