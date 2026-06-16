export interface UnweightedGraphData {
    adjacencyList: Map<number, number[]>;
    weightedAdjacencyList: Map<number, Array<{ node: number; weight: number }>>;
}