import React, { useMemo } from 'react';
import './BFS.css'
import { MyButton } from '../../common/button/Button';
import { useUnweightedGraphApi } from '../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../util/NoCostGraphSendApis';
import { VisualGraphData, VisualNode, VisualEdge } from '../../../util/graphUtils';
import { GraphVisualizer } from '../GraphVisualizer';
import { buildBFSVisualGraphData } from '../../../util/BFSGraphJsonTransfrom';

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: any[];
};

export function BFS({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const resultVisualData = useMemo(() => {
        return buildBFSVisualGraphData(adjacentList, data);
    }, [data, adjacentList]);

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            await postGraphData(GRAPH_ENDPOINTS.BFS, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
    };

    return(
        <div className="bfs-algorithm-container">
            <div className="button-container">
                <MyButton color="blue" onClick={HandleSubmit}>
                    {loading ? "実行中..." : "BFSを実行"}
                </MyButton>
            </div>

            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                
                {error && (
                    <div className="bfs-error-message">
                        エラーが発生しました: {error.message}
                    </div>
                )}
                
                {resultVisualData ? (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer 
                                graphData={resultVisualData} 
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="undirected"
                                nodeColorFn={(node) => {
                                    if (node.isStartNode) return '#FF0000'; // Red for start
                                    if (node.attributes?.visited) return '#4CAF50'; // Green for visited
                                    return node.color || '#42A5F5'; // Default blue
                                }}
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