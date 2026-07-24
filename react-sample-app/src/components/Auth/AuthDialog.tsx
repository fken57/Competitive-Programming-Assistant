import React, { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/Auth/useAuth';
import './AuthDialog.css';

export type AuthDialogMode = 'login' | 'register';

type Props = {
  mode: AuthDialogMode;
  onModeChange: (mode: AuthDialogMode) => void;
  onClose: () => void;
};

export function AuthDialog({ mode, onModeChange, onClose }: Props) {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '認証に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="auth-dialog-title"
        aria-modal="true"
        className="auth-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="auth-dialog-close" type="button" onClick={onClose} aria-label="閉じる">×</button>
        <h2 id="auth-dialog-title">{mode === 'login' ? 'ログイン' : '新規登録'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            ユーザー名
            <input
              autoComplete="username"
              minLength={3}
              maxLength={50}
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            パスワード
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              maxLength={72}
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="auth-dialog-error" role="alert">{error}</p>}
          <button disabled={submitting} type="submit">
            {submitting ? '送信中…' : mode === 'login' ? 'ログイン' : '登録してログイン'}
          </button>
        </form>
        <button
          className="auth-dialog-switch"
          type="button"
          onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'アカウントを新規作成' : '既存アカウントでログイン'}
        </button>
      </section>
    </div>
  );
}
