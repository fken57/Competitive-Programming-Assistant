import React from 'react';

import { BFS } from '../UnorderedUnweighted/BFS';
import { DFS } from '../UnorderedUnweighted/DFS';

import './UnweightedOrdered.css'

import { TopologicalSort } from './TopologicalSort';
import { SCC } from './SCC';
import { DirectedCycle } from './DirectedCycle';

type UnweightedOrderedAlgorithmProps = {
    adjacentList: number[][];
};

export function UnweightedOrderedAlgorithm({ adjacentList }: UnweightedOrderedAlgorithmProps) {
    return (
        <div className="unweighted-ordered-algorithm-container">
            <BFS adjacentList={adjacentList} graphType="directed" />
            <DFS adjacentList={adjacentList} graphType="directed" />
            <DirectedCycle adjacentList={adjacentList} />
            <TopologicalSort adjacentList={adjacentList} />
            <SCC adjacentList={adjacentList} />
        </div>
    );
}
