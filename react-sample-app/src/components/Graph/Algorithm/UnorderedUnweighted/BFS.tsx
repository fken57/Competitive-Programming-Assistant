import React, { useMemo, useState } from 'react';
import './BFS.css';
import './GraphQueryForm.css';
import { LabeledField } from '../../../common/LabeledField';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { GraphVisualizer } from '../../GraphVisualizer';
import { buildBFSVisualGraphData } from '../../../../util/BFSGraphJsonTransfrom';
import { parseStartVertex } from '../../../../util/startVertexUtils';

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
    graphType?: 'undirected' | 'directed';
};

export function BFS({ adjacentList, graphType = 'undirected' }: UnweightedUnorderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const [startVertex, setStartVertex] = useState('1');
    const [validationError, setValidationError] = useState<string | null>(null);

    const resultVisualData = useMemo(() => {
        return buildBFSVisualGraphData(adjacentList, data, graphType);
    }, [data, adjacentList, graphType]);

    const HandleSubmit = async () => {
        let parsedStartVertex: number;
        try {
            parsedStartVertex = parseStartVertex(startVertex, adjacentList.length);
            setValidationError(null);
        } catch (caughtError) {
            setValidationError(caughtError instanceof Error ? caughtError.message : '開始頂点が不正です。');
            return;
        }
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: parsedStartVertex
        };

        try {
            await postGraphData(GRAPH_ENDPOINTS.BFS, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
    };

    return(
        <div className="bfs-algorithm-container">
            <div className="graph-query-form">
                <div className="graph-query-form-grid">
                    <LabeledField
                        label="BFSの開始頂点"
                        hint={`1〜${adjacentList.length}の頂点番号を入力してください。`}
                    >
                        <input
                            type="number"
                            min={1}
                            max={adjacentList.length}
                            value={startVertex}
                            onChange={(event) => setStartVertex(event.target.value)}
                        />
                    </LabeledField>
                </div>
                {validationError && (
                    <p className="graph-query-error" role="alert">エラー: {validationError}</p>
                )}
                <div className="button-container">
                    <MyButton color="blue" onClick={HandleSubmit}>
                        {loading ? '実行中...' : 'BFSを実行'}
                    </MyButton>
                </div>
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
                                graphType={graphType}
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
