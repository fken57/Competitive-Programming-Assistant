import { useState, useCallback } from 'react';
import { postWeightedGraph, CostGraphNeighborListRequest, WeightedGraphEndpoint } from '../../util/CostGraphSendApis';

export const useWeightedGraphApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<any>(null);

    const postGraphData = useCallback(async (endpoint: WeightedGraphEndpoint | string, requestData: CostGraphNeighborListRequest) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await postWeightedGraph(endpoint, requestData);
            setData(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, data, postGraphData };
};
