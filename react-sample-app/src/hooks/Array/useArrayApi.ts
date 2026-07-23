import { useCallback, useState } from 'react';
import {
  ArrayApiResponse,
  ArrayEndpoint,
  postArray,
} from '../../util/ArraySendApis';

export function useArrayApi<TResponse extends ArrayApiResponse = ArrayApiResponse>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  const postArrayData = useCallback(async (endpoint: ArrayEndpoint, values: number[]) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await postArray<TResponse>(endpoint, { values });
      setData(result);
      return result;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error('不明なエラーが発生しました。'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, postArrayData };
}
