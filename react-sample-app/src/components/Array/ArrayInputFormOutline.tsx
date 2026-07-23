import React, { useState } from 'react';
import { MyButton } from '../common/button/Button';
import { parseArrayInput } from '../../util/arrayUtils';
import { InputSourceMode, InputSourceToggle } from '../common/InputSourceToggle';
import { TextFileInput } from '../common/TextFileInput';
import './ArrayInputFormOutline.css';

type ArrayInputFormOutlineProps = {
  onSubmit: (values: number[]) => void;
  onInvalid: (message: string) => void;
  onSourceChange: () => void;
};

export function ArrayInputFormOutline({ onSubmit, onInvalid, onSourceChange }: ArrayInputFormOutlineProps) {
  const [input, setInput] = useState('');
  const [sourceMode, setSourceMode] = useState<InputSourceMode>('manual');

  const handleSourceModeChange = (mode: InputSourceMode) => {
    if (mode === sourceMode) return;
    setSourceMode(mode);
    setInput('');
    onSourceChange();
  };

  const handleSubmit = () => {
    try {
      onSubmit(parseArrayInput(input));
    } catch (error) {
      onInvalid(error instanceof Error ? error.message : '入力の解析に失敗しました。');
    }
  };

  return (
    <div className="array-input-form">
      <div className="array-category-badge">静的</div>
      <InputSourceToggle mode={sourceMode} onChange={handleSourceModeChange} />
      <p className="array-input-help">
        1行目に要素数N、続けて整数配列を空白区切りで入力してください。
      </p>
      {sourceMode === 'manual' ? (
        <textarea
          className="array-input-textarea"
          aria-label="配列の標準入力"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'N\na1 a2 ... aN'}
        />
      ) : (
        <TextFileInput onTextLoaded={setInput} onError={onInvalid} />
      )}
      <div className="array-input-actions">
        <MyButton color="green" onClick={handleSubmit}>
          配列を読み込む
        </MyButton>
      </div>
    </div>
  );
}
