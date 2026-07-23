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
import { isUndirectedTree } from '../../../../util/treeResultUtils';
import './UnweightedUnordered.css'

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function UnweightedUnorderedAlgorithm({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
    const canRunTreeAlgorithms = isUndirectedTree(adjacentList);

    return (
        <div className="graph-algorithm-groups">
            <section>
                <h2>静的Analyze</h2>
                <div className="unweighted-unordered-algorithm-container">
                    <ConnectedComponents adjacentList={adjacentList} />
                    <UnionFind adjacentList={adjacentList} />
                    <LowLink adjacentList={adjacentList} />
                    <IsBinaryTree adjacentList={adjacentList} />
                    <IsTree adjacentList={adjacentList} />
                    {canRunTreeAlgorithms && <UnweightedTreeDistance adjacentList={adjacentList} />}
                </div>
            </section>
            <section>
                <h2>クエリ</h2>
                <div className="unweighted-unordered-algorithm-container">
                    <BFS adjacentList={adjacentList} />
                    <DFS adjacentList={adjacentList} />
                    {canRunTreeAlgorithms && <LCA adjacentList={adjacentList} />}
                </div>
            </section>
        </div>
    );
}
