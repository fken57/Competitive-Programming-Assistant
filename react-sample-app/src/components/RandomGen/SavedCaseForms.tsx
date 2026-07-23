import React, { FormEvent, useState } from 'react';
import { FailureType, GenerationRecipe } from '../../types/RandomGen';
import './RandomGen.css';

const REASON_TAGS = [
  'boundary', 'off-by-one', 'index-base', 'overflow', 'int-overflow',
  'long-long', 'duplicate', 'all-same', 'sorted', 'negative', 'zero-heavy',
  'graph-disconnected', 'graph-cycle', 'graph-multi-edge', 'graph-self-loop',
  'tree-path', 'tree-star', 'recursion-depth', 'root-dependency',
  'fenwick-index', 'segtree-range', 'unionfind-init',
  'binary-search-condition', 'dp-transition', 'greedy-counterexample',
  'input-format', 'unknown',
];

export type KilledCaseInput = {
  title: string;
  recipe: GenerationRecipe;
  failureType: FailureType;
  reasonTags: string[];
  notes: string;
};

export function KilledCaseForm({
  recipe,
  onSubmit,
  onCancel,
}: {
  recipe: GenerationRecipe;
  onSubmit: (input: KilledCaseInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [failureType, setFailureType] = useState<FailureType>('WA');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const additionalTags = customTags.split(',').map((tag) => tag.trim()).filter(Boolean);
    try {
      await onSubmit({
        title,
        recipe,
        failureType,
        reasonTags: Array.from(new Set([...selectedTags, ...additionalTags])),
        notes,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="random-gen-save-form" onSubmit={handleSubmit}>
      <h3>撃墜ケースとして保存</h3>
      <label>タイトル<input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>
        failureType
        <select value={failureType} onChange={(event) => setFailureType(event.target.value as FailureType)}>
          {(['WA', 'RE', 'TLE', 'MLE', 'CE', 'UNKNOWN'] as FailureType[])
            .map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <fieldset>
        <legend>撃墜理由タグ</legend>
        <div className="random-gen-tag-grid">
          {REASON_TAGS.map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={(event) => setSelectedTags((current) =>
                  event.target.checked
                    ? [...current, tag]
                    : current.filter((value) => value !== tag)
                )}
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>
      <label>追加タグ（カンマ区切り）<input value={customTags} onChange={(event) => setCustomTags(event.target.value)} /></label>
      <label>メモ<textarea maxLength={5000} rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
      {error && <p className="random-gen-error" role="alert">{error}</p>}
      <div className="random-gen-actions">
        <button disabled={saving} type="submit">{saving ? '保存中…' : '保存'}</button>
        <button type="button" onClick={onCancel}>キャンセル</button>
      </div>
    </form>
  );
}

export function PresetForm({
  recipe,
  onSubmit,
  onCancel,
}: {
  recipe: GenerationRecipe;
  onSubmit: (name: string, recipe: GenerationRecipe) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  return (
    <form className="random-gen-save-form" onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      setError('');
      try {
        await onSubmit(name, recipe);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : '保存に失敗しました');
      } finally {
        setSaving(false);
      }
    }}>
      <h3>プリセットとして保存</h3>
      <label>プリセット名<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>
      {error && <p className="random-gen-error" role="alert">{error}</p>}
      <div className="random-gen-actions">
        <button disabled={saving} type="submit">{saving ? '保存中…' : '保存'}</button>
        <button type="button" onClick={onCancel}>キャンセル</button>
      </div>
    </form>
  );
}
