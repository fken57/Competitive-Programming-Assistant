import React, { useRef } from 'react';
import { MyButton } from '../common/button/Button';
import { useNavigate } from 'react-router-dom';
import { StateChooseToggle } from './StateChooseButton';
import { parseGraphToAdjacencyList, parseWeightedGraphToAdjacencyList } from '../../util/graphUtils';
import { useUnweightedGraphApi } from '../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../util/NoCostGraphSendApis';
import { useState } from 'react';
import { UnweightedUnorderedAlgorithm } from './Algorithm/UnweightedUnordered';

type AlgorithmFormOutlineProps = {
    hasWeights: boolean;
    graphType: string;
    adjacentList: number[][];
};
export function AlgorithmFormOutline({ hasWeights, graphType, adjacentList }: AlgorithmFormOutlineProps) {
    return (
        <div className="algorithm-form-outline">
            {!hasWeights && graphType === 'undirected' && (
                <UnweightedUnorderedAlgorithm adjacentList={adjacentList} />
            )}
        </div>
    );
}