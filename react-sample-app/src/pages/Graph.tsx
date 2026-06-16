import { GraphInputFormOutline } from "../components/Graph/GraphInputFormOutline";
import { AlgorithmFormOutline } from "../components/Graph/AlgorithmFormOutLine";
import React from "react";
import { useState } from "react";
const GraphPage: React.FC = () => {
  const [graphType, setGraphType] = useState('undirected');
  const [hasWeights, setHasWeights] = useState(false);

  const [adjacentList, setAdjacentList] = useState<number[][]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  return (
    <div>
      <h1>Graph Page</h1>
      <p>This is the Graph page.</p>
      <p>test: {graphType}, hasWeights: {hasWeights.toString()}</p>
      <GraphInputFormOutline 
        graphType={graphType} 
        setGraphType={setGraphType}
        hasWeights={hasWeights} 
        setHasWeights={setHasWeights}
        setAdjacentList={setAdjacentList}
        setIsDataLoaded={setIsDataLoaded} />
      {isDataLoaded && <AlgorithmFormOutline 
        hasWeights={hasWeights}
        graphType={graphType}
        adjacentList={adjacentList}
      />}
    </div>
  );
};

export default GraphPage;
