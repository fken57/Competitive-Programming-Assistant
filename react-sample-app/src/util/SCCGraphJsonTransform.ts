import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { GraphNeighbor } from './BFSGraphJsonTransfrom';

export interface SCCRawApiResponse{
    sccs: number[][];
}

export function buildSCCGraphVisualData(adjacentList: GraphNeighbor[][],data: SCCRawApiResponse | null): VisualGraphData | null {
    if (!data || !data.sccs) return null;

    const nodes: VisualNode[] = [];
    const edges: VisualEdge[] = [];

    // Create nodes
    for (let i = 0; i < data.sccs.length; i++){
        let sccLabel : string = `SCC ${i + 1}:`;
        for (const vertex of data.sccs[i]) {
            sccLabel+= ` ${vertex + 1}`;
        }
        nodes.push({
            id: i+1,
            label: sccLabel,
            color: '#42A5F5'
        });
    }

    let includeInSCC : number[] = [...Array(adjacentList.length).fill(0)];

    for(let i = 0; i < data.sccs.length; i++){
        for(const vertex of data.sccs[i]){
            includeInSCC[vertex] = i;
        }
    }

    // Create edges
    for (let i = 0; i < data.sccs.length; i++) {
        for (const vertex of data.sccs[i]) {
            for (const neighbor of adjacentList[vertex]) {
                const v = typeof neighbor === 'number' ? neighbor : neighbor.to;
                if (includeInSCC[v] !== includeInSCC[vertex]) {
                    edges.push({
                        source: i + 1,
                        target: includeInSCC[v] + 1
                    });
                }
            }
        }
    }

    return {
        nodes,
        edges
    };
}