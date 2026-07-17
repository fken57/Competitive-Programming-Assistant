import React from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useWeightedGraphApi } from '../../../../hooks/Graph/useWeightedGraphApi';
import { WEIGHTED_GRAPH_ENDPOINTS, WeightedEdge } from '../../../../util/CostGraphSendApis';

type Props = { adjacentList: WeightedEdge[][] };

export function Prim({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useWeightedGraphApi();
    const handleSubmit = async () => {
        await postGraphData(WEIGHTED_GRAPH_ENDPOINTS.PRIM, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };
    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : 'Prim法を実行'}</MyButton></div>
            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <><p className="bfs-result-text">{data.is_spanning ? '最小全域木' : '最小全域森'}の重み: {data.total_weight}</p><p className="bfs-result-text">辺: {data.edges.map((edge: { from: number; to: number; weight: number }) => `${edge.from + 1}-${edge.to + 1} (${edge.weight})`).join(', ') || 'なし'}</p></>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">無向重み付きグラフの最小全域木を求めます</p>}
            </div>
        </div>
    );
}
