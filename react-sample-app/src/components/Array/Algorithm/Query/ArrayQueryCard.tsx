import React, { useEffect, useState } from 'react';
import { MyButton } from '../../../common/button/Button';
import { useArrayQueryApi } from '../../../../hooks/Array/useArrayQueryApi';
import {
  ArrayQueryEndpoint,
  ArrayQueryRequest,
  ArrayQueryResponse,
} from '../../../../util/ArrayQueryApi';
import './ArrayQueryAlgorithms.css';

type ArrayQueryCardProps = {
  title: string;
  description: string;
  endpoint: ArrayQueryEndpoint;
  parameterKey: string;
  parameterFields: React.ReactNode;
  buildRequest: () => ArrayQueryRequest;
  renderResult: (data: ArrayQueryResponse) => React.ReactNode;
};

export function ArrayQueryCard({
  title,
  description,
  endpoint,
  parameterKey,
  parameterFields,
  buildRequest,
  renderResult,
}: ArrayQueryCardProps) {
  const { loading, error, data, executeQuery, clearQueryResult } = useArrayQueryApi();
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    clearQueryResult();
    setValidationError('');
  }, [clearQueryResult, parameterKey]);

  const handleExecute = () => {
    if (loading) return;
    setValidationError('');
    try {
      const request = buildRequest();
      void executeQuery(endpoint, request);
    } catch (caughtError) {
      clearQueryResult();
      setValidationError(caughtError instanceof Error ? caughtError.message : '入力値を確認してください。');
    }
  };

  return (
    <section className="array-query-card">
      <div>
        <h2 className="array-query-title">{title}</h2>
        <p className="array-query-description">{description}</p>
      </div>
      <div className="array-query-parameters">{parameterFields}</div>
      <MyButton color="blue" onClick={handleExecute}>
        {loading ? '実行中...' : '実行'}
      </MyButton>
      <div className="array-query-result" aria-live="polite">
        {(validationError || error) && (
          <div className="array-query-error">エラー: {validationError || error?.message}</div>
        )}
        {!loading && !validationError && !error && !data && (
          <p className="array-query-placeholder">パラメーターを入力して実行してください。</p>
        )}
        {data && renderResult(data)}
      </div>
    </section>
  );
}

export function ArrayQueryResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="array-query-result-block">
      <h3>{label}</h3>
      <pre>{value}</pre>
    </div>
  );
}
