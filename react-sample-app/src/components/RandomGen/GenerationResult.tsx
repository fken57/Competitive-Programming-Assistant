import React, { useState } from 'react';
import { GeneratedCase } from '../../types/RandomGen';
import './RandomGen.css';

type Props = {
  result: GeneratedCase;
  loading: boolean;
  onRegenerate: () => void;
  onSaveRecipe: () => void;
};

export function downloadGeneratedInput(inputText: string, seed: string) {
  const url = URL.createObjectURL(new Blob([inputText], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `random-case-${seed}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function GenerationResult({ result, loading, onRegenerate, onSaveRecipe }: Props) {
  const [message, setMessage] = useState('');
  const { recipe, inputText } = result;

  const copyInput = async () => {
    await navigator.clipboard.writeText(inputText);
    setMessage('入力をコピーしました');
  };

  return (
    <section className="random-gen-result">
      <div className="random-gen-result-heading">
        <h2>生成結果</h2>
        <div className="random-gen-actions">
          <button type="button" onClick={copyInput}>Copy</button>
          <button type="button" onClick={() => downloadGeneratedInput(inputText, recipe.seed)}>
            Download .txt
          </button>
          <button type="button" disabled={loading} onClick={onRegenerate}>Regenerate</button>
          <button type="button" onClick={() => {
            onSaveRecipe();
            setMessage('recipeを24時間履歴へ保存しました');
          }}>
            Save recipe
          </button>
          <button type="button" disabled title="認証実装後に利用できます">Mark as killed</button>
          <button type="button" disabled title="認証実装後に利用できます">Save as preset</button>
        </div>
      </div>
      {message && <p className="random-gen-message" role="status">{message}</p>}
      <pre className="random-gen-output">{inputText}</pre>
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
