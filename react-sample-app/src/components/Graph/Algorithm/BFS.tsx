import React from 'react';
import './BFS.css'
import { MyButton } from '../../common/button/Button';
import { useUnweightedGraphApi } from '../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../util/NoCostGraphSendApis';

type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function BFS({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const HandleSubmit = async () => {
        const payload = {
            vertex_count: adjacentList.length,
            neighbors: adjacentList,
            start_vertex: 0
        };

        try {
            // executeOperation の代わりに postGraphData を呼び出します
            await postGraphData(GRAPH_ENDPOINTS.BFS, payload);
        } catch (err) {
            console.error('グラフデータの送信中にエラーが発生しました:', err);
        }
        return 
    };



    return(
        <div className="bfs-algorithm-container">
            <div className="button-container">
                <MyButton
                    color="blue"
                    onClick={HandleSubmit}
                >
                    BFSを実行
                </MyButton>
            </div>

            <div className="result-display-area">
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