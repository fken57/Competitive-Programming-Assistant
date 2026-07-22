import React, { useMemo } from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { GraphVisualizer } from '../../GraphVisualizer';
import { buildDirectedCycleVisualGraphData } from '../../../../util/DirectedCycleGraphJsonTransform';

type Props = { adjacentList: number[][] };

export function DirectedCycle({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const resultVisualData = useMemo(
        () => buildDirectedCycleVisualGraphData(adjacentList, data),
        [adjacentList, data]
    );
    const handleSubmit = async () => {
        await postGraphData(GRAPH_ENDPOINTS.DIRECTED_CYCLE, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };
    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : '有向閉路を検出'}</MyButton></div>
            <div className="result-display-area">
                {resultVisualData && (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer
                                graphData={resultVisualData}
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="directed"
                                nodeColorFn={(node) => node.attributes?.inCycle ? '#FDE68A' : '#FFFFFF'}
                                nodeStrokeColorFn={(node) => node.attributes?.inCycle ? '#DC2626' : '#666'}
                                nodeStrokeWidthFn={(node) => node.attributes?.inCycle ? 5 : 2}
                                edgeColorFn={(edge) => edge.attributes?.inCycle ? '#DC2626' : '#9CA3AF'}
                                edgeWidthFn={(edge) => edge.attributes?.inCycle ? 5 : 2}
                            />
                        </div>
                    </div>
                )}
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <p className="bfs-result-text">{data.has_cycle ? `閉路: ${data.cycle.map((vertex: number) => vertex + 1).join(' → ')}` : '有向閉路はありません。'}</p>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">有向閉路を検出します</p>}
            </div>
        </div>
    );
}
