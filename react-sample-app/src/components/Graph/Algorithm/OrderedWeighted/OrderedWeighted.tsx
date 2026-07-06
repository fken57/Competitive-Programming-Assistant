import React from 'react';
import { Dijkstra } from './Dijkstra';
import '../OrderedUnweighted/UnweightedOrdered.css'; // Reuse CSS

type OrderedWeightedAlgorithmProps = {
    adjacentList: any[]; // It's actually WeightedEdge[][] but we receive any[] from generic form
};

export function OrderedWeightedAlgorithm({ adjacentList }: OrderedWeightedAlgorithmProps) {
    return (
        <div className="unweighted-ordered-algorithm-container">
            <Dijkstra adjacentList={adjacentList} />
        </div>
    );
}
