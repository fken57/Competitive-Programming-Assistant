import React from 'react';
import './AnalysisViewToggle.css';

export type AnalysisViewMode = 'container' | 'list';

type AnalysisViewToggleProps = {
  mode: AnalysisViewMode;
  onChange: (mode: AnalysisViewMode) => void;
  listDisabled?: boolean;
};

export function AnalysisViewToggle({ mode, onChange, listDisabled = false }: AnalysisViewToggleProps) {
  return (
    <fieldset className="analysis-view-toggle">
      <legend>結果表示</legend>
      <label>
        <input
          type="radio"
          name="analysis-view"
          checked={mode === 'container'}
          onChange={() => onChange('container')}
        />
        Container
      </label>
      <label className={listDisabled ? 'disabled' : ''}>
        <input
          type="radio"
          name="analysis-view"
          checked={mode === 'list'}
          disabled={listDisabled}
          onChange={() => onChange('list')}
        />
        一覧（自動実行）
      </label>
    </fieldset>
  );
}
