import { useCallback, useRef, useState } from 'react';
import {
  ArrayQueryEndpoint,
  ArrayQueryRequest,
  ArrayQueryResponse,
  postArrayQuery,
} from '../../util/ArrayQueryApi';

export function useArrayQueryApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ArrayQueryResponse | null>(null);
  const requestSequence = useRef(0);

  const clearQueryResult = useCallback(() => {
    requestSequence.current += 1;
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const executeQuery = useCallback(async (
    endpoint: ArrayQueryEndpoint,
    payload: ArrayQueryRequest,
  ) => {
    const requestID = requestSequence.current + 1;
    requestSequence.current = requestID;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await postArrayQuery(endpoint, payload);
      if (requestSequence.current === requestID) setData(result);
      return result;
    } catch (caughtError) {
      if (requestSequence.current === requestID) {
        setError(caughtError instanceof Error ? caughtError : new Error('不明なエラーが発生しました。'));
      }
      return null;
    } finally {
      if (requestSequence.current === requestID) setLoading(false);
    }
  }, []);

  return { loading, error, data, executeQuery, clearQueryResult };
}
