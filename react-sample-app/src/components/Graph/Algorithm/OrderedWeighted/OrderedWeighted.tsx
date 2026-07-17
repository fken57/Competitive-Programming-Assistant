import React from 'react';
import { Dijkstra } from './Dijkstra';
import { Prim } from './Prim';
import { WeightedTreeDiameter } from './WeightedTreeDiameter';
import '../OrderedUnweighted/UnweightedOrdered.css'; // Reuse CSS

type OrderedWeightedAlgorithmProps = {
    adjacentList: any[]; // It's actually WeightedEdge[][] but we receive any[] from generic form
    graphType: string;
};

export function OrderedWeightedAlgorithm({ adjacentList, graphType }: OrderedWeightedAlgorithmProps) {
    return (
        <div className="unweighted-ordered-algorithm-container">
            <Dijkstra adjacentList={adjacentList} graphType={graphType} />
            {graphType === 'undirected' && <Prim adjacentList={adjacentList} />}
            {graphType === 'undirected' && <WeightedTreeDiameter adjacentList={adjacentList} />}
        </div>
    );
}
