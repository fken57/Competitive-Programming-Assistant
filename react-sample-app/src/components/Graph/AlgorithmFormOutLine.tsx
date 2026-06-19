import { UnweightedUnorderedAlgorithm } from './Algorithm/UnweightedUnordered';


type AlgorithmFormOutlineProps = {
    hasWeights: boolean;
    graphType: string;
    adjacentList: any[];
};
export function AlgorithmFormOutline({ hasWeights, graphType, adjacentList }: AlgorithmFormOutlineProps) {
    return (
        <div className="algorithm-form-outline">
            {!hasWeights && graphType === 'undirected' && (
                <UnweightedUnorderedAlgorithm 
                    adjacentList={adjacentList} 
                />
            )}
  
        </div>
    );
}
