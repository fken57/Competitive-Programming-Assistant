import React, { useMemo } from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css'; // Reuse CSS layout
import { MyButton } from '../../../common/button/Button';
import { useWeightedGraphApi } from '../../../../hooks/Graph/useWeightedGraphApi';
import { WEIGHTED_GRAPH_ENDPOINTS, WeightedEdge } from '../../../../util/CostGraphSendApis';
import { buildDijkstraVisualGraphData } from '../../../../util/DijkstraGraphJsonTransform';
import { GraphVisualizer } from '../../GraphVisualizer';

type OrderedWeightedAlgorithmProps = {
    adjacentList: WeightedEdge[][];
    graphType: string;
};

export function Dijkstra({ adjacentList, graphType }: OrderedWeightedAlgorithmProps) {
    const { postGraphData, loading, error, data } = useWeightedGraphApi();

    const resultVisualData = useMemo(() => {
        return buildDijkstraVisualGraphData(adjacentList, data, graphType === 'directed' ? 'directed' : 'undirected');
    }, [data, adjacentList, graphType]);

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            await postGraphData(WEIGHTED_GRAPH_ENDPOINTS.DIJKSTRA, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
    };

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container">
                <MyButton color="blue" onClick={HandleSubmit}>
                    {loading ? "実行中..." : "ダイクストラ法を実行"}
                </MyButton>
            </div>

            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                
                {data && (
                    <p className="bfs-result-text">
                        頂点1からの最短距離が計算されました。
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
                                graphType={graphType}
                                edgeColorFn={(edge) => {
                                    if (edge.isShortestPath) return '#E91E63'; // Pink for shortest path
                                    return '#999'; // Default edge color
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
