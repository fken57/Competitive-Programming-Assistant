import React from 'react';
import './CompactAnalysisList.css';

export type StaticAnalysisItem = {
  id: string;
  status: 'success' | 'skipped' | 'error';
  data?: unknown;
  reason?: string;
};

type CompactAnalysisListProps = {
  results: StaticAnalysisItem[];
  titles: Record<string, string>;
  loading: boolean;
  error: Error | null;
};

const PREVIEW_ITEMS = 20;

export function truncateAnalysisValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (value.length <= PREVIEW_ITEMS) return value.map(truncateAnalysisValue);
    return [
      ...value.slice(0, PREVIEW_ITEMS).map(truncateAnalysisValue),
      `…残り${value.length - PREVIEW_ITEMS}件`,
    ];
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, truncateAnalysisValue(child)]),
    );
  }
  return value;
}

export function CompactAnalysisList({ results, titles, loading, error }: CompactAnalysisListProps) {
  if (loading) return <p className="compact-analysis-state">静的Analyzeを順番に実行しています…</p>;
  if (error) return <div className="compact-analysis-error">エラー: {error.message}</div>;

  return (
    <div className="compact-analysis-list">
      {results.map((result) => (
        <article className={`compact-analysis-row status-${result.status}`} key={result.id}>
          <div className="compact-analysis-row-main">
            <span className="compact-analysis-status">{result.status}</span>
            <strong>{titles[result.id] ?? result.id}</strong>
            <code>
              {result.status === 'success'
                ? JSON.stringify(truncateAnalysisValue(result.data))
                : result.reason}
            </code>
          </div>
          {result.status === 'success' && (
            <details>
              <summary>詳細</summary>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </details>
          )}
        </article>
      ))}
    </div>
  );
}
