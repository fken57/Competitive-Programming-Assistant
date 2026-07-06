import React, { useMemo } from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css'; // Reuse CSS layout
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { buildSCCGraphVisualData } from '../../../../util/SCCGraphJsonTransform';
import { GraphVisualizer } from '../../GraphVisualizer';

type UnweightedOrderedAlgorithmProps = {
    adjacentList: number[][];
};

export function SCC({adjacentList}: UnweightedOrderedAlgorithmProps) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const resultVisualData = useMemo(() => {
        return buildSCCGraphVisualData(adjacentList, data);
    }, [data, adjacentList]);

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
                
                {data && resultVisualData ? (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer 
                                graphData={resultVisualData} 
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="directed"
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