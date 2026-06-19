import React from 'react';
import { MyButton } from '../../common/button/Button';
import { useUnweightedGraphApi } from '../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../util/NoCostGraphSendApis';
import { BFS } from './BFS';
import { IsBinaryTree } from './IsBinaryTree';
import './UnweightedUnordered.css'

import { VisualGraphData } from '../../../util/graphUtils';

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: any[];
};

export function UnweightedUnorderedAlgorithm({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
    return (
        <div className="unweighted-unordered-algorithm-container">
            {<BFS adjacentList={adjacentList} />}
            {<IsBinaryTree adjacentList={adjacentList} />}
        </div>
    );
}