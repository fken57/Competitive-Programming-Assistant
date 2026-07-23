import React from 'react';
import { GenerationHistory as HistoryItem } from '../../types/RandomGen';
import './RandomGen.css';

type Props = {
  history: HistoryItem[];
  onRegenerate: (item: HistoryItem) => void;
};

export function GenerationHistory({ history, onRegenerate }: Props) {
  return (
    <section className="random-gen-history">
      <h2>24時間履歴</h2>
      {history.length === 0 ? (
        <p>生成履歴はありません。</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.recipe.structureType} / {item.recipe.caseType}</strong>
                <span>seed: {item.recipe.seed}</span>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              <button type="button" onClick={() => onRegenerate(item)}>再生成</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
