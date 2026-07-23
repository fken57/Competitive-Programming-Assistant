import React, { useMemo, useState } from 'react';
import { GeneratorPreset, KilledCase } from '../../types/RandomGen';
import './RandomGen.css';

export function SavedCaseLibrary({
  killedCases,
  presets,
  onRegenerateKilled,
  onRegeneratePreset,
}: {
  killedCases: KilledCase[];
  presets: GeneratorPreset[];
  onRegenerateKilled: (item: KilledCase) => void;
  onRegeneratePreset: (item: GeneratorPreset) => void;
}) {
  const [tagFilter, setTagFilter] = useState('');
  const visibleKilledCases = useMemo(
    () => killedCases.filter((item) =>
      !tagFilter || item.reasonTags.some((tag) => tag.includes(tagFilter))
    ),
    [killedCases, tagFilter],
  );

  return (
    <section className="random-gen-library">
      <div>
        <h2>撃墜ケース</h2>
        <label className="random-gen-library-filter">
          タグ検索
          <input value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} />
        </label>
        {visibleKilledCases.length === 0 ? <p>条件に一致する撃墜ケースはありません。</p> : (
          <ul>
            {visibleKilledCases.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.failureType} / {item.reasonTags.join(', ') || 'タグなし'}</span>
                  {item.notes && <small>{item.notes}</small>}
                </div>
                <button type="button" onClick={() => onRegenerateKilled(item)}>再生成</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2>プリセット</h2>
        {presets.length === 0 ? <p>保存されたプリセットはありません。</p> : (
          <ul>
            {presets.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.recipe.structureType} / {item.recipe.caseType}</span>
                </div>
                <button type="button" onClick={() => onRegeneratePreset(item)}>生成</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
