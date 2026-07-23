import React from 'react';
import './CompactAnalysisList.css';
import {
  AnalysisDisplayField,
  StaticAnalysisFormatter,
  formatAnalysisReason,
} from '../../util/staticAnalysisFormatting';

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
  formatResult: StaticAnalysisFormatter;
};

const PREVIEW_ITEMS = 20;

const STATUS_LABELS: Record<StaticAnalysisItem['status'], string> = {
  success: '完了',
  skipped: '省略',
  error: 'エラー',
};

function AnalysisFields({ fields }: { fields: AnalysisDisplayField[] }) {
  return (
    <dl className="compact-analysis-fields">
      {fields.map((field, index) => (
        <div className="compact-analysis-field" key={`${field.label}-${index}`}>
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CompactAnalysisList({
  results,
  titles,
  loading,
  error,
  formatResult,
}: CompactAnalysisListProps) {
  if (loading) return <p className="compact-analysis-state">静的Analyzeを順番に実行しています…</p>;
  if (error) return <div className="compact-analysis-error">エラー: {error.message}</div>;

  return (
    <div className="compact-analysis-list">
      {results.map((result) => {
        const previewFields = result.status === 'success'
          ? formatResult(result.id, result.data, PREVIEW_ITEMS)
          : [];
        const detailFields = result.status === 'success'
          ? formatResult(result.id, result.data)
          : [];

        return (
          <article className={`compact-analysis-row status-${result.status}`} key={result.id}>
            <div className="compact-analysis-row-main">
              <span className="compact-analysis-status">{STATUS_LABELS[result.status]}</span>
              <strong>{titles[result.id] ?? result.id}</strong>
              {result.status === 'success'
                ? <AnalysisFields fields={previewFields} />
                : <p className="compact-analysis-reason">{formatAnalysisReason(result.reason)}</p>}
            </div>
            {result.status === 'success' && (
              <details>
                <summary>詳細</summary>
                <AnalysisFields fields={detailFields} />
              </details>
            )}
          </article>
        );
      })}
    </div>
  );
}
