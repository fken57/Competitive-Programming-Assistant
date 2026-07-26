import React, { FormEvent, useEffect, useState } from 'react';
import { Pagination } from '../common/Pagination';
import { GeneratorPreset, KilledCase, PaginationMetadata } from '../../types/RandomGen';
import './RandomGen.css';

export function SavedCaseLibrary({
  killedCases,
  presets,
  onRegenerateKilled,
  onRegeneratePreset,
  killedPagination,
  killedTag,
  onKilledPageChange,
  onKilledTagChange,
  onDeleteKilled,
  deletingKilledId,
  loadingKilledCases,
}: {
  killedCases: KilledCase[];
  presets: GeneratorPreset[];
  onRegenerateKilled: (item: KilledCase) => void;
  onRegeneratePreset: (item: GeneratorPreset) => void;
  killedPagination: PaginationMetadata;
  killedTag: string;
  onKilledPageChange: (page: number) => void;
  onKilledTagChange: (tag: string) => void;
  onDeleteKilled: (item: KilledCase) => void;
  deletingKilledId?: string;
  loadingKilledCases?: boolean;
}) {
  const [tagInput, setTagInput] = useState(killedTag);
  const interactionsDisabled = Boolean(deletingKilledId) || Boolean(loadingKilledCases);

  useEffect(() => {
    setTagInput(killedTag);
  }, [killedTag]);

  const handleFilter = (event: FormEvent) => {
    event.preventDefault();
    onKilledTagChange(tagInput.trim());
  };

  const confirmDelete = (item: KilledCase) => {
    if (window.confirm(`撃墜ケース「${item.title}」を削除しますか？この操作は元に戻せません。`)) {
      onDeleteKilled(item);
    }
  };

  return (
    <section className="random-gen-library">
      <div>
        <h2>撃墜ケース</h2>
        <form className="random-gen-library-filter" onSubmit={handleFilter}>
          <label>
            タグ検索（完全一致）
            <input
              value={tagInput}
              disabled={interactionsDisabled}
              onChange={(event) => setTagInput(event.target.value)}
            />
          </label>
          <div className="random-gen-item-actions">
            <button type="submit" disabled={interactionsDisabled}>検索</button>
            {killedTag && (
              <button
                type="button"
                disabled={interactionsDisabled}
                onClick={() => onKilledTagChange('')}
              >
                解除
              </button>
            )}
          </div>
        </form>
        {killedCases.length === 0 ? <p>条件に一致する撃墜ケースはありません。</p> : (
          <ul>
            {killedCases.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.failureType} / {item.reasonTags.join(', ') || 'タグなし'}</span>
                  {item.notes && <small>{item.notes}</small>}
                </div>
                <div className="random-gen-item-actions">
                  <button type="button" onClick={() => onRegenerateKilled(item)}>再生成</button>
                  <button
                    className="random-gen-danger"
                    type="button"
                    disabled={interactionsDisabled}
                    onClick={() => confirmDelete(item)}
                  >
                    {deletingKilledId === item.id ? '削除中…' : '削除'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          {...killedPagination}
          onPageChange={onKilledPageChange}
          label="撃墜ケースのページ切替"
          disabled={interactionsDisabled}
        />
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
