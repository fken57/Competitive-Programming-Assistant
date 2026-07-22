import React, { useMemo, useState } from 'react';
import './IsBinaryTree.css';
import { MyButton } from '../../../common/button/Button';
import { useUnweightedGraphApi } from '../../../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../../../util/NoCostGraphSendApis';
import { GraphVisualizer } from '../../GraphVisualizer';
import { buildUnionFindVisualGraphs } from '../../../../util/UnionFindGraphJsonTransform';

type Props = { adjacentList: number[][] };

export function UnionFind({ adjacentList }: Props) {
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();
    const [showParentForest, setShowParentForest] = useState(false);
    const visualGraphs = useMemo(
        () => buildUnionFindVisualGraphs(adjacentList, data),
        [adjacentList, data]
    );
    const componentColors = ['#BFDBFE', '#BBF7D0', '#FDE68A', '#E9D5FF', '#FED7AA', '#FBCFE8'];
    const handleSubmit = async () => {
        setShowParentForest(false);
        await postGraphData(GRAPH_ENDPOINTS.UNION_FIND, { vertex_count: adjacentList.length, neighbors: adjacentList });
    };

    return (
        <div className="is-binary-tree-algorithm-container">
            <div className="button-container"><MyButton color="blue" onClick={handleSubmit}>{loading ? '実行中...' : 'Union-Findを実行'}</MyButton></div>
            <div className="result-display-area">
                {visualGraphs && (
                    <>
                        <div className="button-container">
                            <MyButton color="green" onClick={() => setShowParentForest(value => !value)}>
                                {showParentForest ? 'Show component graph' : 'Show parent forest'}
                            </MyButton>
                        </div>
                        <div className="bfs-visualizer-wrapper">
                            <div className="bfs-visualizer-box">
                                <GraphVisualizer
                                    graphData={showParentForest ? visualGraphs.parentForest : visualGraphs.componentGraph}
                                    isDataLoaded={true}
                                    errorMessage=""
                                    graphType={showParentForest ? 'directed' : 'undirected'}
                                    layoutMode={showParentForest ? 'tree' : 'force'}
                                    nodeColorFn={(node) => componentColors[(node.attributes?.componentIndex ?? 0) % componentColors.length]}
                                    nodeStrokeColorFn={(node) => node.attributes?.isRoot ? '#2563EB' : '#666'}
                                    nodeStrokeWidthFn={(node) => node.attributes?.isRoot ? 5 : 2}
                                    edgeColorFn={(edge) => edge.attributes?.isParentEdge ? '#2563EB' : '#999'}
                                    edgeWidthFn={(edge) => edge.attributes?.isParentEdge ? 4 : 2}
                                />
                            </div>
                        </div>
                    </>
                )}
                <h3 className="bfs-result-title">実行結果</h3>
                {data?.components?.map((component: number[], index: number) => <p className="bfs-result-text" key={index}>グループ {index + 1}: {component.map((vertex) => vertex + 1).join(', ')}</p>)}
                {data?.parents && <p className="bfs-result-text">代表元: {data.parents.map((parent: number) => parent + 1).join(', ')}</p>}
                {error && <div className="bfs-error-message">エラーが発生しました: {error.message}</div>}
                {!loading && !error && !data && <p className="bfs-placeholder-text">全辺を順に union した最終グループを表示します</p>}
            </div>
        </div>
    );
}
