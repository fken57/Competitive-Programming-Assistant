import React from 'react';

import { BFS } from './BFS';
import { IsBinaryTree } from './IsBinaryTree';
import { IsTree } from './IsTree';
import { UnweightedTreeDistance } from './UnweightedTreeDistance';
import './UnweightedUnordered.css'

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function UnweightedUnorderedAlgorithm({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
    return (
        <div className="unweighted-unordered-algorithm-container">
            <BFS adjacentList={adjacentList} />
            <IsBinaryTree adjacentList={adjacentList} />
            <IsTree adjacentList={adjacentList} />
            <UnweightedTreeDistance adjacentList={adjacentList} />
        </div>
    );
}