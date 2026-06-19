
import './IsBinaryTree.css'
import { MyButton } from '../../common/button/Button';
import { useUnweightedGraphApi } from '../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../util/NoCostGraphSendApis';
import { buildBipartiteVisualGraphData , IsBipartiteTree} from '../../../util/BipatiteGraphJsonTransfrom';
import React, { useMemo } from 'react';
import { GraphVisualizer } from '../GraphVisualizer';


type UnweightedUnorderedAlgorithmProps = {
    adjacentList: number[][];
};

export function IsBinaryTree({ adjacentList }: UnweightedUnorderedAlgorithmProps) {
        
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const resultVisualData = useMemo(() => {
        return buildBipartiteVisualGraphData(adjacentList, data);
    }, [data, adjacentList]);

    const isBinaryTree = useMemo(() => {
        return IsBipartiteTree(data);
    }, [data]);

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

            <div className="result-display-area">
                <h3 className="bfs-result-title">実行結果</h3>
                <p className="bfs-result-text">
                    {isBinaryTree ? 'このグラフは二分木です。' : 'このグラフは二分木ではありません。'}
                </p>
                {error && (
                    <div className="bfs-error-message">
                        エラーが発生しました: {error.message}
                    </div>
                )}
    
                
                {isBinaryTree && resultVisualData ? (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer 
                                graphData={resultVisualData} 
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="undirected"
                                nodeColorFn={(node) => {
                                    if (node.attributes?.groupOne) return '#FF0000'; // Red for Group 1
                                    if (node.attributes?.groupTwo) return '#0000FF'; // Blue for Group 2
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