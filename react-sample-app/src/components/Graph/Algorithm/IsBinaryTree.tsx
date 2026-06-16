import React from 'react';
import './IsBinaryTree.css'
import { MyButton } from '../../common/button/Button';
import { useUnweightedGraphApi } from '../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../util/NoCostGraphSendApis';

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function IsBinaryTree({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            // executeOperation の代わりに postGraphData を呼び出します
            await postGraphData(GRAPH_ENDPOINTS.IS_BINARY_TREE, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
        return 
    };



    return(
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container">
                <MyButton
                    color="blue"
                    onClick={HandleSubmit}
                >
                    二分木の判定
                </MyButton>
            </div>

            <div className="result-display-area" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h3 style={{ marginTop: 0 }}>実行結果</h3>
                
                {error && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        エラーが発生しました: {error.message}
                    </div>
                )}
                
                {data ? (
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0 }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                ) : (
                    /* ここも loading に修正しています */
                    !loading && !error && <p style={{ color: '#6c757d', margin: 0 }}>結果がここに表示されます</p>
                )}
            </div>
        </div>
    );

}