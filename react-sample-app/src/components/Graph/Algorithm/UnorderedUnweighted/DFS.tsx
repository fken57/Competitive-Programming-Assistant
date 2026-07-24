import React, { useMemo, useState } from 'react';
import './IsBinaryTree.css';
import './GraphQueryForm.css';
import { LabeledField } from '../../../common/LabeledField';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { GraphVisualizer } from '../../GraphVisualizer';
import { buildDFSVisualGraphData } from '../../../../util/DFSGraphJsonTransform';
import { parseStartVertex } from '../../../../util/startVertexUtils';

type DFSProps = {
    adjacentList: number[][];
    graphType?: 'undirected' | 'directed';
};

export function DFS({ adjacentList, graphType = 'undirected' }: DFSProps) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const [startVertex, setStartVertex] = useState('1');
    const [validationError, setValidationError] = useState<string | null>(null);
    const resultVisualData = useMemo(
        () => buildDFSVisualGraphData(adjacentList, data, graphType),
        [adjacentList, data, graphType]
    );

    const handleSubmit = async () => {
        let parsedStartVertex: number;
        try {
            parsedStartVertex = parseStartVertex(startVertex, adjacentList.length);
            setValidationError(null);
        } catch (caughtError) {
            setValidationError(caughtError instanceof Error ? caughtError.message : '開始頂点が不正です。');
            return;
        }
        await postGraphData(GRAPH_ENDPOINTS.DFS, {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: parsedStartVertex
        });
    };

    const vertices = (values: number[] | undefined) => values?.map((vertex) => vertex + 1).join(' → ') || 'なし';

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="graph-query-form">
                <div className="graph-query-form-grid">
                    <LabeledField
                        label="DFSの開始頂点"
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
                    <MyButton color="blue" onClick={handleSubmit}>
                        {loading ? '実行中...' : `DFSを実行（${graphType === 'directed' ? '有向' : '無向'}）`}
                    </MyButton>
                </div>
            </div>
            <div className="result-display-area">
                {resultVisualData && (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer
                                graphData={resultVisualData}
                                isDataLoaded={true}
                                errorMessage=""
                                graphType={graphType}
                                layoutMode="tree"
                                nodeColorFn={(node) => node.attributes?.visited ? '#BBF7D0' : '#E5E7EB'}
                                edgeColorFn={(edge) => edge.attributes?.isTreeEdge ? '#2563EB' : '#9CA3AF'}
                                edgeWidthFn={(edge) => edge.attributes?.isTreeEdge ? 4 : 1.5}
                                edgeDashArrayFn={(edge) => edge.attributes?.isTreeEdge ? undefined : '6 4'}
                            />
                        </div>
                    </div>
                )}
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <><p className="bfs-result-text">行きがけ順: {vertices(data.pre_order)}</p><p className="bfs-result-text">帰りがけ順: {vertices(data.post_order)}</p></>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">頂点1から探索します</p>}
            </div>
        </div>
    );
}
