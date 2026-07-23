import React from 'react';
import './InputSourceToggle.css';

export type InputSourceMode = 'manual' | 'text-file';

type InputSourceToggleProps = {
  mode: InputSourceMode;
  onChange: (mode: InputSourceMode) => void;
};

export function InputSourceToggle({ mode, onChange }: InputSourceToggleProps) {
  return (
    <fieldset className="input-source-toggle">
      <legend>入力方法</legend>
      <label>
        <input
          type="radio"
          name="input-source"
          checked={mode === 'manual'}
          onChange={() => onChange('manual')}
        />
        直接入力
      </label>
      <label>
        <input
          type="radio"
          name="input-source"
          checked={mode === 'text-file'}
          onChange={() => onChange('text-file')}
        />
        .txt入力
      </label>
    </fieldset>
  );
}
