import { VisualGraphData, VisualNode, VisualEdge } from './graphUtils';
import { GraphNeighbor } from './BFSGraphJsonTransfrom';

export interface IsTreeRawApiResponse {
    is_tree: boolean;
    cycle: number[];
    components: number[][];
}

export function buildIsTreeVisualGraphData(adjacentList: GraphNeighbor[][], data: IsTreeRawApiResponse | null): VisualGraphData | null {
    if (!data) return null;
    
    const N = adjacentList.length;
    const componentByVertex = new Map<number, number>();
    (data.components ?? []).forEach((component, componentIndex) => {
        component.forEach(vertex => componentByVertex.set(vertex, componentIndex));
    });
    const cycleVertices = new Set(data.cycle ?? []);
    const cycleEdges = new Set<string>();
    for (let index = 0; index + 1 < (data.cycle?.length ?? 0); index++) {
        cycleEdges.add([data.cycle[index], data.cycle[index + 1]].sort().join('-'));
    }
    const nodes: VisualNode[] = Array.from({ length: N }, (_, i) => ({
        id: i,
        label: (i + 1).toString(),
        attributes: {
            componentIndex: componentByVertex.get(i) ?? -1,
            inCycle: cycleVertices.has(i)
        }
    }));

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
                    attributes: { inCycle: cycleEdges.has(edgeId) }
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
