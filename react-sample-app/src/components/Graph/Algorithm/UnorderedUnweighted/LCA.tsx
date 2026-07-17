import React, { useState } from 'react';
import './IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';

type Props = { adjacentList: number[][] };

export function LCA({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const [root, setRoot] = useState('1');
    const [queryText, setQueryText] = useState('');
    const [inputError, setInputError] = useState('');

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
            await postGraphData(GRAPH_ENDPOINTS.LCA, { vertex_count: adjacentList.length, neighbors: adjacentList, root: parsedRoot, queries });
        } catch (submitError) {
            setInputError(submitError instanceof Error ? submitError.message : '入力エラーが発生しました。');
        }
    };

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="form-outline-input-area"><input value={root} onChange={(event) => setRoot(event.target.value)} placeholder="根の頂点 (例: 1)" /><textarea value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder={'クエリを1行ずつ入力\n例: 2 3'} /></div>
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : 'LCAを計算'}</MyButton></div>
            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                {data?.lcas?.map((vertex: number, index: number) => <p className="bfs-result-text" key={index}>クエリ {index + 1}: 頂点 {vertex + 1}</p>)}
                {(inputError || error) && <div className="bfs-error-message">エラーが発生しました: {inputError || error?.message}</div>}
                {!loading && !error && !inputError && !data && <p className="bfs-placeholder-text">無向木に対する最小共通祖先を計算します</p>}
            </div>
        </div>
    );
}
