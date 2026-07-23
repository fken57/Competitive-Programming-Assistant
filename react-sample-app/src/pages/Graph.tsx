import React, { useState } from "react";
import { GraphInputFormOutline } from "../components/Graph/GraphInputFormOutline";
import { AlgorithmFormOutline } from "../components/Graph/AlgorithmFormOutLine";
import { GraphVisualizer } from "../components/Graph/GraphVisualizer";
import { VisualGraphData, WeightedAdjacencyListItem } from "../util/graphUtils";
import './Graph.css';

type GraphType = 'undirected' | 'directed';
type GraphAdjacencyList = number[][] | WeightedAdjacencyListItem[][];

const GraphPage: React.FC = () => {
  const [graphType, setGraphType] = useState<GraphType>('undirected');
  const [hasWeights, setHasWeights] = useState(false);

  const [adjacentList, setAdjacentList] = useState<GraphAdjacencyList>([]);
  const [visualGraphData, setVisualGraphData] = useState<VisualGraphData | null>(null);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [graphRevision, setGraphRevision] = useState(0);

  const invalidateGraph = () => {
    setAdjacentList([]);
    setVisualGraphData(null);
    setIsDataLoaded(false);
    setErrorMessage("");
    setGraphRevision((revision) => revision + 1);
  };

  const handleGraphTypeChange = (nextGraphType: string) => {
    if (nextGraphType === graphType) return;
    setGraphType(nextGraphType as GraphType);
    invalidateGraph();
  };

  const handleWeightChange = (nextHasWeights: boolean) => {
    if (nextHasWeights === hasWeights) return;
    setHasWeights(nextHasWeights);
    invalidateGraph();
  };

  const handleGraphSubmitted = () => {
    setGraphRevision((revision) => revision + 1);
  };

  return (
    <div className="graph-page-wrapper">
      <div className="graph-page-container">
        <div className="graph-page-left">
          <h1 className="graph-page-title">Graph Analyzer</h1>
          <p className="graph-page-desc">グラフデータを入力し、可視化やアルゴリズムの実行を行います。</p>
          
          <GraphInputFormOutline 
            graphType={graphType} 
            setGraphType={handleGraphTypeChange}
            hasWeights={hasWeights} 
            setHasWeights={handleWeightChange}
            setAdjacentList={setAdjacentList}
            setVisualGraphData={setVisualGraphData}
            setIsDataLoaded={setIsDataLoaded}
            setErrorMessage={setErrorMessage} 
            onGraphSubmitted={handleGraphSubmitted}
          />
        </div>

        <div className="graph-page-right">
          <GraphVisualizer 
            graphData={visualGraphData} 
            isDataLoaded={isDataLoaded}
            errorMessage={errorMessage}
            graphType={graphType}
            nodeColorFn={(node) => {
              if (node.isStartNode) return '#FF9800'; // Orange for start
              if (node.attributes?.visited) return '#4CAF50'; // Green for visited
              return node.color || '#42A5F5'; // Default blue
            }}
          />
        </div>
      </div>

      {isDataLoaded && (
        <div className="graph-page-bottom">
          <AlgorithmFormOutline 
            key={graphRevision}
            hasWeights={hasWeights}
            graphType={graphType}
            adjacentList={adjacentList}
          />
        </div>
      )}
    </div>
  );
};

export default GraphPage;
