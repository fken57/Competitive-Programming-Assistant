import React, { useMemo } from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css'; // Reuse CSS layout
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { buildTopologicalSortVisualGraphData } from '../../../../util/TopologicalSortGraphJsonTransform';
import { GraphVisualizer } from '../../GraphVisualizer';

type UnweightedOrderedAlgorithmProps = {
    adjacentList: number[][];
};

export function TopologicalSort({ adjacentList }: UnweightedOrderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const resultVisualData = useMemo(() => {
        return buildTopologicalSortVisualGraphData(adjacentList, data);
    }, [data, adjacentList]);

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            await postGraphData(GRAPH_ENDPOINTS.TOPOLOGICAL_SORT, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
    };

    const sortedPathStr = useMemo(() => {
        if (data?.vertices && data.vertices.length > 0) {
            return data.vertices.map((v: number) => v + 1).join(' -> ');
        }
        return '';
    }, [data]);

    return(
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container">
                <MyButton color="blue" onClick={HandleSubmit}>
                    {loading ? "実行中..." : "トポロジカルソートを実行"}
                </MyButton>
            </div>

            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                
                {data && (
                    <p className="bfs-result-text">
                        トポロジカルソート結果: {sortedPathStr || "ソートできませんでした。"}
                    </p>
                )}

                {error && (
                    <div className="bfs-error-message">
                        エラーが発生しました: {error.message} <br/>
                        (閉路が存在するためソートできない可能性があります)
                    </div>
                )}
                
                {data && resultVisualData ? (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer 
                                graphData={resultVisualData} 
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="directed"
                                nodeColorFn={(node) => {
                                    if (node.attributes?.hasOrder) return '#9C27B0'; // Purple for sorted nodes
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
