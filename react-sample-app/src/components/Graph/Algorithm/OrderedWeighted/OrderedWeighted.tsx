import React from 'react';
import { Dijkstra } from './Dijkstra';
import { Prim } from './Prim';
import { WeightedTreeDiameter } from './WeightedTreeDiameter';
import { isUndirectedTree } from '../../../../util/treeResultUtils';
import { WeightedEdge } from '../../../../util/CostGraphSendApis';
import '../OrderedUnweighted/UnweightedOrdered.css'; // Reuse CSS

type OrderedWeightedAlgorithmProps = {
    adjacentList: WeightedEdge[][];
    graphType: string;
};

export function OrderedWeightedAlgorithm({ adjacentList, graphType }: OrderedWeightedAlgorithmProps) {
    const canRunTreeAlgorithms = graphType === 'undirected' && isUndirectedTree(adjacentList);

    return (
        <div className="unweighted-ordered-algorithm-container">
            <Dijkstra adjacentList={adjacentList} graphType={graphType} />
            {graphType === 'undirected' && <Prim adjacentList={adjacentList} />}
            {canRunTreeAlgorithms && <WeightedTreeDiameter adjacentList={adjacentList} />}
        </div>
    );
}
