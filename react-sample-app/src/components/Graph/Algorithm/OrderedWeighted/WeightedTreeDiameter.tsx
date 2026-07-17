import React from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useWeightedGraphApi } from '../../../../hooks/Graph/useWeightedGraphApi';
import { WEIGHTED_GRAPH_ENDPOINTS, WeightedEdge } from '../../../../util/CostGraphSendApis';

type Props = { adjacentList: WeightedEdge[][] };

export function WeightedTreeDiameter({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useWeightedGraphApi();
    const handleSubmit = async () => {
        await postGraphData(WEIGHTED_GRAPH_ENDPOINTS.TREE_DIAMETER, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };
    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : '重み付き木の直径を計算'}</MyButton></div>
            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <p className="bfs-result-text">木の直径: {data.diameter}（頂点 {data.vertex1 + 1} と頂点 {data.vertex2 + 1}）</p>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">無向重み付き木に対して計算します</p>}
            </div>
        </div>
    );
}
