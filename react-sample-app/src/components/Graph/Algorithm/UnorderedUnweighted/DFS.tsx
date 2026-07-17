import React from 'react';
import './IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';

type DFSProps = {
    adjacentList: number[][];
    graphType?: 'undirected' | 'directed';
};

export function DFS({ adjacentList, graphType = 'undirected' }: DFSProps) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const handleSubmit = async () => {
        await postGraphData(GRAPH_ENDPOINTS.DFS, {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        });
    };

    const vertices = (values: number[] | undefined) => values?.map((vertex) => vertex + 1).join(' → ') || 'なし';

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container">
                <MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : `DFSを実行（${graphType === 'directed' ? '有向' : '無向'}）`}</MyButton>
            </div>
            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <><p className="bfs-result-text">行きがけ順: {vertices(data.pre_order)}</p><p className="bfs-result-text">帰りがけ順: {vertices(data.post_order)}</p></>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">頂点1から探索します</p>}
            </div>
        </div>
    );
}
