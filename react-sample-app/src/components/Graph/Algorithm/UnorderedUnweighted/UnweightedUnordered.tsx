import React from 'react';

import { BFS } from './BFS';
import { IsBinaryTree } from './IsBinaryTree';
import { IsTree } from './IsTree';
import { UnweightedTreeDistance } from './UnweightedTreeDistance';
import { DFS } from './DFS';
import { ConnectedComponents } from './ConnectedComponents';
import { UnionFind } from './UnionFind';
import { LowLink } from './LowLink';
import { LCA } from './LCA';
import './UnweightedUnordered.css'

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function UnweightedUnorderedAlgorithm({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
    return (
        <div className="unweighted-unordered-algorithm-container">
            <BFS adjacentList={adjacentList} />
            <DFS adjacentList={adjacentList} />
            <ConnectedComponents adjacentList={adjacentList} />
            <UnionFind adjacentList={adjacentList} />
            <LowLink adjacentList={adjacentList} />
            <IsBinaryTree adjacentList={adjacentList} />
            <IsTree adjacentList={adjacentList} />
            <UnweightedTreeDistance adjacentList={adjacentList} />
            <LCA adjacentList={adjacentList} />
        </div>
    );
}
