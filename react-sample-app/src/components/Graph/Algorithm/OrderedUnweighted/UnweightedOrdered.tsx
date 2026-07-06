import React from 'react';

import { BFS } from '../UnorderedUnweighted/BFS';

import './UnweightedOrdered.css'

import { TopologicalSort } from './TopologicalSort';
import { SCC } from './SCC';

type UnweightedOrderedAlgorithmProps = {
    adjacentList: number[][];
};

export function UnweightedOrderedAlgorithm({ adjacentList }: UnweightedOrderedAlgorithmProps) {
    return (
        <div className="unweighted-ordered-algorithm-container">
            {<BFS adjacentList={adjacentList} />}
            <TopologicalSort adjacentList={adjacentList} />
            <SCC adjacentList={adjacentList} />
        </div>
    );
}