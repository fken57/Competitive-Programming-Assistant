import React from 'react';
import { SegmentedControl } from './SegmentedControl';

export type InputSourceMode = 'manual' | 'text-file';

type InputSourceToggleProps = {
  mode: InputSourceMode;
  onChange: (mode: InputSourceMode) => void;
};

export function InputSourceToggle({ mode, onChange }: InputSourceToggleProps) {
  return (
    <SegmentedControl
      legend="入力方法"
      name="input-source"
      value={mode}
      options={[
        { value: 'manual', label: '直接入力' },
        { value: 'text-file', label: '.txt入力' },
      ]}
      onChange={onChange}
    />
  );
}
