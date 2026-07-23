import React, { useEffect, useState } from 'react';
import { GenerationHistory } from '../components/RandomGen/GenerationHistory';
import { GenerationResult } from '../components/RandomGen/GenerationResult';
import { RandomGenForm } from '../components/RandomGen/RandomGenForm';
import { GeneratedCase, GenerationHistory as HistoryItem, GenerationRecipe } from '../types/RandomGen';
import { postGenerateRandomCase } from '../util/RandomGenApi';
import {
  loadGenerationHistory,
  saveGenerationRecipe,
} from '../util/randomGenHistoryStorage';
import './RandomGen.css';

export default function RandomGenPage() {
  const [result, setResult] = useState<GeneratedCase | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setHistory(loadGenerationHistory());
  }, []);

  const generate = async (recipe: GenerationRecipe) => {
    setLoading(true);
    setError('');
    try {
      const generated = await postGenerateRandomCase(recipe);
      setResult(generated);
      setHistory(saveGenerationRecipe(generated.recipe));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentRecipe = () => {
    if (result) setHistory(saveGenerationRecipe(result.recipe));
  };

  const regenerateHistory = (item: HistoryItem) => {
    void generate(item.recipe);
  };

  return (
    <main className="random-gen-page">
      <header>
        <span className="random-gen-badge">Random Gen</span>
        <h1>競技プログラミング入力生成</h1>
        <p>seedから再現可能な配列・木・グラフの特殊ケースを生成します。</p>
      </header>
      <RandomGenForm loading={loading} onGenerate={(recipe) => void generate(recipe)} />
      {error && <p className="random-gen-page-error" role="alert">エラー: {error}</p>}
      {result && (
        <GenerationResult
          result={result}
          loading={loading}
          onRegenerate={() => void generate(result.recipe)}
          onSaveRecipe={saveCurrentRecipe}
        />
      )}
      <GenerationHistory history={history} onRegenerate={regenerateHistory} />
    </main>
  );
}
