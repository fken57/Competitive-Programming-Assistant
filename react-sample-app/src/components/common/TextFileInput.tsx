import React, { useRef, useState } from 'react';
import './TextFileInput.css';

export const MAX_TEXT_FILE_BYTES = 10 * 1024 * 1024;
const PREVIEW_CHARACTER_LIMIT = 2_000;

type TextFileInputProps = {
  onTextLoaded: (text: string) => void;
  onError: (message: string) => void;
};

type FileSummary = {
  name: string;
  size: number;
  preview: string;
  truncated: boolean;
};

export function TextFileInput({ onTextLoaded, onError }: TextFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState<FileSummary | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSummary(null);
    onTextLoaded('');

    try {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        throw new Error('.txtファイルを選択してください。');
      }
      if (file.size > MAX_TEXT_FILE_BYTES) {
        throw new Error('ファイルサイズは10 MiB以下にしてください。');
      }

      const rawText = await file.text();
      const text = rawText.replace(/^\uFEFF/, '');
      setSummary({
        name: file.name,
        size: file.size,
        preview: text.slice(0, PREVIEW_CHARACTER_LIMIT),
        truncated: text.length > PREVIEW_CHARACTER_LIMIT,
      });
      onTextLoaded(text);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました。');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="text-file-input">
      <label className="text-file-select">
        <span>.txtファイルを選択</span>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          aria-label=".txtファイル"
          onChange={handleFile}
        />
      </label>
      <p className="text-file-limit">UTF-8、最大10 MiB</p>
      {summary && (
        <div className="text-file-summary">
          <strong>{summary.name}</strong>
          <span>{summary.size.toLocaleString()} bytes</span>
          <pre>{summary.preview}{summary.truncated ? '\n…プレビューを省略しました' : ''}</pre>
        </div>
      )}
    </div>
  );
}
