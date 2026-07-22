import React, { useMemo } from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css'; // Reuse CSS layout
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { buildSCCVisualGraphs } from '../../../../util/SCCGraphJsonTransform';
import { GraphVisualizer } from '../../GraphVisualizer';

type UnweightedOrderedAlgorithmProps = {
    adjacentList: number[][];
};

export function SCC({adjacentList}: UnweightedOrderedAlgorithmProps) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const resultVisualGraphs = useMemo(() => {
        return buildSCCVisualGraphs(adjacentList, data);
    }, [data, adjacentList]);
    const componentColors = ['#BFDBFE', '#BBF7D0', '#FDE68A', '#E9D5FF', '#FED7AA', '#FBCFE8'];

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            await postGraphData(GRAPH_ENDPOINTS.SCC, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
    };

    const sccStr = useMemo(() => {
        if (data?.sccs && data.sccs.length > 0) {
            return data.sccs.map((scc: number[], index: number) => 
                `SCC ${index + 1}: [${scc.map(v => v + 1).join(', ')}]`
            ).join(' | ');
        }
        return '';
    }, [data]);

    return(
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container">
                <MyButton color="blue" onClick={HandleSubmit}>
                    {loading ? "実行中..." : "強連結成分分解を実行"}
                </MyButton>
            </div>

            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                
                {data && (
                    <p className="bfs-result-text">
                        強連結成分分解結果: {sccStr || "分解できませんでした。"}
                    </p>
                )}

                {error && (
                    <div className="bfs-error-message">
                        エラーが発生しました: {error.message}
                    </div>
                )}
                
                {data && resultVisualGraphs ? (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer 
                                graphData={resultVisualGraphs.condensationGraph}
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="directed"
                                layoutMode="linear"
                                nodeColorFn={(node) => componentColors[(node.attributes?.componentIndex ?? 0) % componentColors.length]}
                            />
                        </div>
                        <details className="bfs-debug-info">
                            <summary>Show original graph colored by SCC</summary>
                            <div className="bfs-visualizer-box">
                                <GraphVisualizer
                                    graphData={resultVisualGraphs.originalGraph}
                                    isDataLoaded={true}
                                    errorMessage=""
                                    graphType="directed"
                                    nodeColorFn={(node) => componentColors[(node.attributes?.componentIndex ?? 0) % componentColors.length]}
                                />
                            </div>
                        </details>
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
