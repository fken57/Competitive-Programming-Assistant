import React, { useEffect, useState } from 'react';
import { GenerationHistory } from '../components/RandomGen/GenerationHistory';
import { GenerationResult } from '../components/RandomGen/GenerationResult';
import { RandomGenForm } from '../components/RandomGen/RandomGenForm';
import { KilledCaseForm, KilledCaseInput, PresetForm } from '../components/RandomGen/SavedCaseForms';
import { SavedCaseLibrary } from '../components/RandomGen/SavedCaseLibrary';
import { useAuth } from '../hooks/Auth/useAuth';
import {
  GeneratedCase,
  GenerationHistory as HistoryItem,
  GenerationRecipe,
  GeneratorPreset,
  KilledCase,
} from '../types/RandomGen';
import {
  listGeneratorPresets,
  listKilledCases,
  listServerHistory,
  postGenerateRandomCase,
  saveGeneratorPreset,
  saveKilledCase,
  saveServerHistory,
} from '../util/RandomGenApi';
import {
  loadGenerationHistory,
  saveGenerationRecipe,
} from '../util/randomGenHistoryStorage';
import './RandomGen.css';

export default function RandomGenPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<GeneratedCase | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [killedCases, setKilledCases] = useState<KilledCase[]>([]);
  const [presets, setPresets] = useState<GeneratorPreset[]>([]);
  const [showKilledForm, setShowKilledForm] = useState(false);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) {
      setHistory(loadGenerationHistory());
      setKilledCases([]);
      setPresets([]);
      return () => {
        active = false;
      };
    }
    Promise.all([listServerHistory(), listKilledCases(), listGeneratorPresets()])
      .then(([serverHistory, serverKilledCases, serverPresets]) => {
        if (!active) return;
        setHistory(serverHistory);
        setKilledCases(serverKilledCases);
        setPresets(serverPresets);
      })
      .catch((caughtError) => {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : '保存データの取得に失敗しました');
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  const generate = async (recipe: GenerationRecipe) => {
    setLoading(true);
    setError('');
    try {
      const generated = await postGenerateRandomCase(recipe);
      setResult(generated);
      if (user) {
        try {
          const saved = await saveServerHistory(generated.recipe);
          setHistory((current) => [saved, ...current].slice(0, 50));
        } catch (historyError) {
          setError(historyError instanceof Error
            ? `入力は生成しましたが、履歴保存に失敗しました: ${historyError.message}`
            : '入力は生成しましたが、履歴保存に失敗しました');
        }
      } else {
        setHistory(saveGenerationRecipe(generated.recipe));
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentRecipe = () => {
    if (!result) return;
    if (user) {
      void saveServerHistory(result.recipe).then((saved) => {
        setHistory((current) => [saved, ...current].slice(0, 50));
      }).catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : '履歴保存に失敗しました');
      });
    } else {
      setHistory(saveGenerationRecipe(result.recipe));
    }
  };

  const regenerateHistory = (item: HistoryItem) => {
    void generate(item.recipe);
  };

  const handleSaveKilledCase = async (input: KilledCaseInput) => {
    const saved = await saveKilledCase(input);
    setKilledCases((current) => [saved, ...current]);
    setShowKilledForm(false);
  };

  const handleSavePreset = async (name: string, recipe: GenerationRecipe) => {
    const saved = await saveGeneratorPreset(name, recipe);
    setPresets((current) => [saved, ...current]);
    setShowPresetForm(false);
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
          authenticated={Boolean(user)}
          onRegenerate={() => void generate(result.recipe)}
          onSaveRecipe={saveCurrentRecipe}
          onMarkKilled={() => setShowKilledForm(true)}
          onSavePreset={() => setShowPresetForm(true)}
        />
      )}
      {result && user && showKilledForm && (
        <KilledCaseForm
          recipe={result.recipe}
          onSubmit={handleSaveKilledCase}
          onCancel={() => setShowKilledForm(false)}
        />
      )}
      {result && user && showPresetForm && (
        <PresetForm
          recipe={result.recipe}
          onSubmit={handleSavePreset}
          onCancel={() => setShowPresetForm(false)}
        />
      )}
      <GenerationHistory history={history} onRegenerate={regenerateHistory} />
      {user && (
        <SavedCaseLibrary
          killedCases={killedCases}
          presets={presets}
          onRegenerateKilled={(item) => void generate(item.recipe)}
          onRegeneratePreset={(item) => void generate(item.recipe)}
        />
      )}
    </main>
  );
}
