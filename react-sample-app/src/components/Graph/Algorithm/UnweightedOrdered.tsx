import React from 'react';

import { BFS } from './BFS';
import { IsBinaryTree } from './IsBinaryTree';
import './UnweightedUnordered.css'

type UnweightedOrderedAlgorithmProps = {
    adjacentList: any[];
};

export function UnweightedOrderedAlgorithm({ adjacentList }: UnweightedOrderedAlgorithmProps) {
    return (
        <div className="unweighted-ordered-algorithm-container">
            {<BFS adjacentList={adjacentList} />}
            {<IsBinaryTree adjacentList={adjacentList} />}
        </div>
    );
}