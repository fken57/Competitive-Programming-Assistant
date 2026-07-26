import React from 'react';
import './Pagination.css';

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  label: string;
  disabled?: boolean;
};

export function Pagination({ page, pageSize, total, onPageChange, label, disabled = false }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        前のページ
      </button>
      <span aria-live="polite">{page} / {totalPages} ページ</span>
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        次のページ
      </button>
    </nav>
  );
}
