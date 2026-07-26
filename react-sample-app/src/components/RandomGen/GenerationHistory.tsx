import React from 'react';
import { Pagination } from '../common/Pagination';
import {
  GenerationHistory as HistoryItem,
  PaginationMetadata,
} from '../../types/RandomGen';
import './RandomGen.css';

type Props = {
  history: HistoryItem[];
  pagination: PaginationMetadata;
  onRegenerate: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
  onPageChange: (page: number) => void;
  deletingId?: string;
};

export function GenerationHistory({
  history,
  pagination,
  onRegenerate,
  onDelete,
  onPageChange,
  deletingId,
}: Props) {
  const confirmDelete = (item: HistoryItem) => {
    if (window.confirm('この生成履歴を削除しますか？この操作は元に戻せません。')) {
      onDelete(item);
    }
  };

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
              <div className="random-gen-item-actions">
                <button type="button" onClick={() => onRegenerate(item)}>再生成</button>
                <button
                  className="random-gen-danger"
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={() => confirmDelete(item)}
                >
                  {deletingId === item.id ? '削除中…' : '削除'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        {...pagination}
        onPageChange={onPageChange}
        label="生成履歴のページ切替"
        disabled={Boolean(deletingId)}
      />
    </section>
  );
}
