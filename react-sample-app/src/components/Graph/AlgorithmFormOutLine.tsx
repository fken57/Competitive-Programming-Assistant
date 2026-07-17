import { UnweightedUnorderedAlgorithm } from './Algorithm/UnorderedUnweighted/UnweightedUnordered';


import { UnweightedOrderedAlgorithm } from './Algorithm/OrderedUnweighted/UnweightedOrdered';
import { OrderedWeightedAlgorithm } from './Algorithm/OrderedWeighted/OrderedWeighted';

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
            {!hasWeights && graphType === 'directed' && (
                <UnweightedOrderedAlgorithm 
                    adjacentList={adjacentList} 
                />
            )}
            {hasWeights && graphType === 'undirected' && (
                <OrderedWeightedAlgorithm 
                    adjacentList={adjacentList} 
                    graphType={graphType}
                />
            )}
            {hasWeights && graphType === 'directed' && (
                <OrderedWeightedAlgorithm 
                    adjacentList={adjacentList} 
                    graphType={graphType}
                />
            )}
        </div>
    );
}
