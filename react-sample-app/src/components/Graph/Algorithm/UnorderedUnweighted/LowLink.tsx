import React from 'react';
import './IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';

type Props = { adjacentList: number[][] };

export function LowLink({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const handleSubmit = async () => {
        await postGraphData(GRAPH_ENDPOINTS.LOW_LINK, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : 'Low-Linkを実行'}</MyButton></div>
            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <><p className="bfs-result-text">関節点: {data.articulation_points?.map((vertex: number) => vertex + 1).join(', ') || 'なし'}</p><p className="bfs-result-text">橋: {data.bridges?.map((bridge: { from: number; to: number }) => `${bridge.from + 1} - ${bridge.to + 1}`).join(', ') || 'なし'}</p></>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">関節点と橋を検出します</p>}
            </div>
        </div>
    );
}
