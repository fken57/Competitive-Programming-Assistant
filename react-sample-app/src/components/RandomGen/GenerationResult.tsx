import React, { useState } from 'react';
import { GeneratedCase } from '../../types/RandomGen';
import { createRecipeShareURL } from '../../util/randomGenRecipeUrl';
import './RandomGen.css';

type Props = {
  result: GeneratedCase;
  loading: boolean;
  authenticated: boolean;
  onRegenerate: () => void;
  onSaveRecipe: () => void;
  onMarkKilled: () => void;
  onSavePreset: () => void;
};

export const INLINE_OUTPUT_LIMITS = {
  bytes: 4 * 1024,
  lines: 50,
  lineLength: 120,
} as const;

export type OutputDisplayDecision = {
  inline: boolean;
  bytes: number;
  lines: number;
  maxLineLength: number;
};

export function getOutputDisplayDecision(inputText: string): OutputDisplayDecision {
  const lines = inputText.replace(/\r?\n$/, '').split(/\r?\n/);
  const bytes = new Blob([inputText]).size;
  const maxLineLength = lines.reduce((maximum, line) => Math.max(maximum, line.length), 0);

  return {
    inline: bytes <= INLINE_OUTPUT_LIMITS.bytes
      && lines.length <= INLINE_OUTPUT_LIMITS.lines
      && maxLineLength <= INLINE_OUTPUT_LIMITS.lineLength,
    bytes,
    lines: lines.length,
    maxLineLength,
  };
}

export function downloadGeneratedInput(inputText: string, seed: string) {
  const url = URL.createObjectURL(new Blob([inputText], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `random-case-${seed}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function GenerationResult({
  result,
  loading,
  authenticated,
  onRegenerate,
  onSaveRecipe,
  onMarkKilled,
  onSavePreset,
}: Props) {
  const [message, setMessage] = useState('');
  const { recipe, inputText } = result;
  const outputDisplay = getOutputDisplayDecision(inputText);

  const copyInput = async () => {
    await navigator.clipboard.writeText(inputText);
    setMessage('入力をコピーしました');
  };

  const copyShareURL = async () => {
    await navigator.clipboard.writeText(createRecipeShareURL(recipe, window.location.href));
    setMessage('共有URLをコピーしました');
  };

  return (
    <section className="random-gen-result">
      <div className="random-gen-result-heading">
        <h2>生成結果</h2>
        <div className="random-gen-actions">
          {outputDisplay.inline && <button type="button" onClick={copyInput}>Copy</button>}
          <button type="button" onClick={copyShareURL}>Copy share URL</button>
          <button
            className={!outputDisplay.inline ? 'random-gen-download-primary' : ''}
            type="button"
            onClick={() => downloadGeneratedInput(inputText, recipe.seed)}
          >
            Download .txt
          </button>
          <button type="button" disabled={loading} onClick={onRegenerate}>Regenerate</button>
          <button type="button" onClick={() => {
            onSaveRecipe();
            setMessage('recipeを24時間履歴へ保存しました');
          }}>
            Save recipe
          </button>
          <button
            type="button"
            disabled={!authenticated}
            title={authenticated ? '' : 'ログインすると利用できます'}
            onClick={onMarkKilled}
          >
            Mark as killed
          </button>
          <button
            type="button"
            disabled={!authenticated}
            title={authenticated ? '' : 'ログインすると利用できます'}
            onClick={onSavePreset}
          >
            Save as preset
          </button>
        </div>
      </div>
      {message && <p className="random-gen-message" role="status">{message}</p>}
      {outputDisplay.inline ? (
        <pre className="random-gen-output">{inputText}</pre>
      ) : (
        <div className="random-gen-output-omitted" role="status">
          <strong>出力が大きいため、画面表示を省略しました。</strong>
          <span>
            {outputDisplay.bytes.toLocaleString()} bytes・
            {outputDisplay.lines.toLocaleString()} lines
          </span>
          <span>「Download .txt」から生成結果を保存してください。</span>
        </div>
      )}
      <details className="random-gen-recipe">
        <summary>生成recipe</summary>
        <dl>
          <div><dt>seed</dt><dd>{recipe.seed}</dd></div>
          <div><dt>generatorVersion</dt><dd>{recipe.generatorVersion}</dd></div>
          <div><dt>rngAlgorithm</dt><dd>{recipe.rngAlgorithm}</dd></div>
          <div><dt>structureType</dt><dd>{recipe.structureType}</dd></div>
          <div><dt>caseType</dt><dd>{recipe.caseType}</dd></div>
          {Object.entries(recipe.params).map(([name, value]) => (
            <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>
          ))}
          <div><dt>indexBase</dt><dd>{recipe.outputFormat.indexBase}</dd></div>
          <div><dt>hasT</dt><dd>{recipe.outputFormat.hasT ? 'true' : 'false'}</dd></div>
        </dl>
      </details>
    </section>
  );
}
