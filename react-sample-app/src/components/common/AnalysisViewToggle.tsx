import React from 'react';
import { SegmentedControl } from './SegmentedControl';
import './AnalysisViewToggle.css';

export type AnalysisViewMode = 'container' | 'list';

type AnalysisViewToggleProps = {
  mode: AnalysisViewMode;
  onChange: (mode: AnalysisViewMode) => void;
  listDisabled?: boolean;
};

export function AnalysisViewToggle({ mode, onChange, listDisabled = false }: AnalysisViewToggleProps) {
  return (
    <SegmentedControl
      className="analysis-view-toggle"
      legend="結果表示"
      name="analysis-view"
      value={mode}
      options={[
        { value: 'container', label: 'Container' },
        { value: 'list', label: '一覧（自動実行）', disabled: listDisabled },
      ]}
      onChange={onChange}
    />
  );
}
