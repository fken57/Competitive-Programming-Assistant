import React, { useMemo, useState } from 'react';
import './IsBinaryTree.css';
import './GraphQueryForm.css';
import { MyButton } from '../../../common/button/Button';
import { LabeledField } from '../../../common/LabeledField';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { GraphVisualizer } from '../../GraphVisualizer';
import { buildLCAVisualGraphData } from '../../../../util/LCAGraphJsonTransform';

type Props = { adjacentList: number[][] };

export function LCA({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const [root, setRoot] = useState('1');
    const [queryText, setQueryText] = useState('');
    const [inputError, setInputError] = useState('');
    const [submittedQueries, setSubmittedQueries] = useState<Array<[number, number]>>([]);
    const [queryIndex, setQueryIndex] = useState(0);
    const resultVisualData = useMemo(
        () => buildLCAVisualGraphData(adjacentList, data?.root, submittedQueries[queryIndex], data?.lcas?.[queryIndex]),
        [adjacentList, data, submittedQueries, queryIndex]
    );

    const handleSubmit = async () => {
        try {
            const parsedRoot = Number(root) - 1;
            if (!Number.isInteger(parsedRoot)) throw new Error('根は頂点番号で指定してください。');
            const queries = queryText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
                const values = line.split(/\s+/).map(Number);
                if (values.length !== 2 || values.some((value) => !Number.isInteger(value))) throw new Error('クエリは「u v」を1行ずつ入力してください。');
                return [values[0] - 1, values[1] - 1] as [number, number];
            });
            setInputError('');
            const result = await postGraphData(GRAPH_ENDPOINTS.LCA, { vertex_count: adjacentList.length, neighbors: adjacentList, root: parsedRoot, queries });
            if (result !== null) {
                setSubmittedQueries(queries);
                setQueryIndex(0);
            }
        } catch (submitError) {
            setInputError(submitError instanceof Error ? submitError.message : '入力エラーが発生しました。');
        }
    };

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="graph-query-form">
                <div className="graph-query-form-grid">
                    <LabeledField
                        label="LCAの根の頂点"
                        hint={`1〜${adjacentList.length}の頂点番号を入力してください。`}
                    >
                        <input
                            type="number"
                            min={1}
                            max={adjacentList.length}
                            value={root}
                            onChange={(event) => setRoot(event.target.value)}
                        />
                    </LabeledField>
                    <LabeledField
                        className="lca-query-field"
                        label="LCAクエリ"
                        hint="1行につき「u v」の形式で入力してください。"
                    >
                        <textarea
                            rows={5}
                            value={queryText}
                            onChange={(event) => setQueryText(event.target.value)}
                            placeholder={'2 3\n4 5'}
                        />
                    </LabeledField>
                </div>
                {inputError && (
                    <p className="graph-query-error" role="alert">エラー: {inputError}</p>
                )}
                <div className="button-container">
                    <MyButton color="blue" onClick={handleSubmit}>
                        {loading ? '実行中...' : 'LCAを計算'}
                    </MyButton>
                </div>
            </div>
            <div className="result-display-area">
                {resultVisualData && (
                    <>
                        <div className="button-container">
                            <MyButton color="gray" onClick={() => setQueryIndex(index => Math.max(0, index - 1))}>Previous</MyButton>
                            <span>Query {queryIndex + 1} / {submittedQueries.length}</span>
                            <MyButton color="gray" onClick={() => setQueryIndex(index => Math.min(submittedQueries.length - 1, index + 1))}>Next</MyButton>
                        </div>
                        <div className="bfs-visualizer-wrapper">
                            <div className="bfs-visualizer-box">
                                <GraphVisualizer
                                    graphData={resultVisualData}
                                    isDataLoaded={true}
                                    errorMessage=""
                                    graphType="undirected"
                                    layoutMode="tree"
                                    nodeColorFn={(node) => {
                                        if (node.attributes?.isLCA) return '#86EFAC';
                                        if (node.attributes?.isQueryVertex) return '#FDE68A';
                                        if (node.attributes?.isRoot) return '#BFDBFE';
                                        return '#FFFFFF';
                                    }}
                                    nodeStrokeColorFn={(node) => node.attributes?.isLCA ? '#16A34A' : '#666'}
                                    nodeStrokeWidthFn={(node) => node.attributes?.isLCA ? 5 : 2}
                                    edgeColorFn={(edge) => {
                                        if (edge.attributes?.inLeftPath) return '#7C3AED';
                                        if (edge.attributes?.inRightPath) return '#EA580C';
                                        if (edge.attributes?.inRootPath) return '#2563EB';
                                        return '#D1D5DB';
                                    }}
                                    edgeWidthFn={(edge) => edge.attributes?.inLeftPath || edge.attributes?.inRightPath || edge.attributes?.inRootPath ? 5 : 1.5}
                                />
                            </div>
                        </div>
                    </>
                )}
                <h3 className="bfs-result-title">実行結果</h3>
                {data?.lcas?.map((vertex: number, index: number) => <p className="bfs-result-text" key={index}>クエリ {index + 1}: 頂点 {vertex + 1}</p>)}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !inputError && !data && <p className="bfs-placeholder-text">無向木に対する最小共通祖先を計算します</p>}
            </div>
        </div>
    );
}
