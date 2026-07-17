import React from 'react';
import './IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';

type Props = { adjacentList: number[][] };

export function ConnectedComponents({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const handleSubmit = async () => {
        await postGraphData(GRAPH_ENDPOINTS.CONNECTED_COMPONENTS, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : '連結成分を取得'}</MyButton></div>
            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                {data?.components?.map((component: number[], index: number) => <p className="bfs-result-text" key={index}>成分 {index + 1}: {component.map((vertex) => vertex + 1).join(', ')}</p>)}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">無向グラフの連結成分を表示します</p>}
            </div>
        </div>
    );
}
