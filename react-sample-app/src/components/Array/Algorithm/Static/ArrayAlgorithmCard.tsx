import React from 'react';
import { MyButton } from '../../../common/button/Button';
import { useArrayApi } from '../../../../hooks/Array/useArrayApi';
import { ArrayApiResponse, ArrayEndpoint } from '../../../../util/ArraySendApis';
import './StaticArrayAlgorithms.css';

type ArrayAlgorithmCardProps = {
  title: string;
  description: string;
  endpoint: ArrayEndpoint;
  values: number[];
  renderResult: (data: ArrayApiResponse) => React.ReactNode;
};

export function ArrayAlgorithmCard({
  title,
  description,
  endpoint,
  values,
  renderResult,
}: ArrayAlgorithmCardProps) {
  const { loading, error, data, postArrayData } = useArrayApi();

  return (
    <section className="array-algorithm-card">
      <div>
        <h2 className="array-algorithm-title">{title}</h2>
        <p className="array-algorithm-description">{description}</p>
      </div>
      <MyButton color="blue" onClick={() => postArrayData(endpoint, values)}>
        {loading ? '実行中...' : '実行'}
      </MyButton>
      <div className="array-algorithm-result" aria-live="polite">
        {error && <div className="array-algorithm-error">エラー: {error.message}</div>}
        {!loading && !error && !data && (
          <p className="array-algorithm-placeholder">実行すると結果がここに表示されます。</p>
        )}
        {data && renderResult(data)}
      </div>
    </section>
  );
}

export function ArrayResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="array-result-block">
      <h3>{label}</h3>
      <pre>{value}</pre>
    </div>
  );
}
