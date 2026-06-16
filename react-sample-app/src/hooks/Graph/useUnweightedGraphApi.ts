import { useState , useCallback} from 'react';
import { postUnweightedGraph , NoCostGraphNeighborListRequest , GraphEndpoint } from '../../util/NoCostGraphSendApis';

export const useUnweightedGraphApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<any>(null);

    const postGraphData = useCallback(async (endpoint: GraphEndpoint | string, requestData: NoCostGraphNeighborListRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await postUnweightedGraph(endpoint, requestData);
            setData(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, data, postGraphData };
};