import React, { useState } from "react";
import { GraphInputFormOutline } from "../components/Graph/GraphInputFormOutline";
import { AlgorithmFormOutline } from "../components/Graph/AlgorithmFormOutLine";
import { GraphVisualizer } from "../components/Graph/GraphVisualizer";
import { VisualGraphData } from "../util/graphUtils";
import './Graph.css';

const GraphPage: React.FC = () => {
  const [graphType, setGraphType] = useState('undirected');
  const [hasWeights, setHasWeights] = useState(false);

  const [adjacentList, setAdjacentList] = useState<any[]>([]);
  const [visualGraphData, setVisualGraphData] = useState<VisualGraphData | null>(null);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="graph-page-wrapper">
      <div className="graph-page-container">
        <div className="graph-page-left">
          <h1 className="graph-page-title">Graph Analyzer</h1>
          <p className="graph-page-desc">グラフデータを入力し、可視化やアルゴリズムの実行を行います。</p>
          
          <GraphInputFormOutline 
            graphType={graphType} 
            setGraphType={setGraphType}
            hasWeights={hasWeights} 
            setHasWeights={setHasWeights}
            setAdjacentList={setAdjacentList}
            setVisualGraphData={setVisualGraphData}
            setIsDataLoaded={setIsDataLoaded}
            setErrorMessage={setErrorMessage} 
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
