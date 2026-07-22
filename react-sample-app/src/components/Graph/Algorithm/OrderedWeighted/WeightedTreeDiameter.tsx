import React, { useMemo } from 'react';
import '../UnorderedUnweighted/IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useWeightedGraphApi } from '../../../../hooks/Graph/useWeightedGraphApi';
import { WEIGHTED_GRAPH_ENDPOINTS, WeightedEdge } from '../../../../util/CostGraphSendApis';
import { GraphVisualizer } from '../../GraphVisualizer';
import { buildWeightedTreeDiameterVisualGraphData } from '../../../../util/WeightedResultGraphTransforms';

type Props = { adjacentList: WeightedEdge[][] };

export function WeightedTreeDiameter({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useWeightedGraphApi();
    const resultVisualData = useMemo(
        () => buildWeightedTreeDiameterVisualGraphData(adjacentList, data),
        [adjacentList, data]
    );
    const handleSubmit = async () => {
        await postGraphData(WEIGHTED_GRAPH_ENDPOINTS.TREE_DIAMETER, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };
    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : '重み付き木の直径を計算'}</MyButton></div>
            <div className="result-display-area">
                {resultVisualData && (
                    <div className="bfs-visualizer-wrapper">
                        <div className="bfs-visualizer-box">
                            <GraphVisualizer
                                graphData={resultVisualData}
                                isDataLoaded={true}
                                errorMessage=""
                                graphType="undirected"
                                layoutMode="tree"
                                nodeColorFn={(node) => node.attributes?.isEndpoint ? '#FDBA74' : '#FFFFFF'}
                                edgeColorFn={(edge) => edge.attributes?.inDiameterPath ? '#DC2626' : '#9CA3AF'}
                                edgeWidthFn={(edge) => edge.attributes?.inDiameterPath ? 5 : 2}
                            />
                        </div>
                    </div>
                )}
                <h3 className="bfs-result-title">実行結果</h3>
                {data && <p className="bfs-result-text">木の直径: {data.diameter}（頂点 {data.vertex1 + 1} と頂点 {data.vertex2 + 1}）</p>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">無向重み付き木に対して計算します</p>}
            </div>
        </div>
    );
}
