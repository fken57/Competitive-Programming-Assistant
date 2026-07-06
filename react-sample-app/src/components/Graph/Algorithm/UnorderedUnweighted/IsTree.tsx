import React, { useMemo } from 'react';
import './IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { buildIsTreeVisualGraphData } from '../../../../util/IsTreeGraphJsonTransform';
import { GraphVisualizer } from '../../GraphVisualizer';

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function IsTree({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const resultVisualData = useMemo(() => {
        return buildIsTreeVisualGraphData(adjacentList, data);
    }, [data, adjacentList]);

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            await postGraphData(GRAPH_ENDPOINTS.IS_TREE, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
    };


    return(
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container">
                <MyButton color="blue" onClick={HandleSubmit}>
                    {loading ? "実行中..." : "木であるか判定"}
                </MyButton>
            </div>

            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                
                {data && (
                    <p className="bfs-result-text">
                        {data.is_tree ? 'このグラフは木です。' : 'このグラフは木ではありません。'}
                    </p>
                )}
                
                {error && (
                    <div className="bfs-error-message">
                        エラーが発生しました: {error.message}
                    </div>
                )}
                
                {data && resultVisualData ? (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer 
                                graphData={resultVisualData} 
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="undirected"
                            />
                        </div>
                        <div className="bfs-debug-info">
                            <details>
                                <summary>バックエンドからのレスポンス(デバッグ用)</summary>
                                <pre>{JSON.stringify(data, null, 2)}</pre>
                            </details>
                        </div>
                    </div>
                ) : (
                    !loading && !error && <p className="bfs-placeholder-text">結果がここに表示されます</p>
                )}
            </div>
        </div>
    );
}
