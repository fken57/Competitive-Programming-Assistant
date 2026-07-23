import React from 'react';
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
  return (
    <section className="random-gen-library">
      <div>
        <h2>撃墜ケース</h2>
        {killedCases.length === 0 ? <p>保存された撃墜ケースはありません。</p> : (
          <ul>
            {killedCases.map((item) => (
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
