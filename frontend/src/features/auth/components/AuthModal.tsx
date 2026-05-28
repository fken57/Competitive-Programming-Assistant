import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  authActions: ReturnType<typeof useAuth>;
};

export default function AuthModal({ isOpen, onClose, authActions }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const { login, register, loading, error, setError } = authActions;

  if (!isOpen) return null;

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setLocalSuccess(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLocalSuccess(null);

    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください。');
      return;
    }

    if (activeTab === 'login') {
      const success = await login(username, password);
      if (success) {
        setUsername('');
        setPassword('');
        onClose();
      }
    } else {
      const success = await register(username, password);
      if (success) {
        setLocalSuccess('ユーザー登録が完了しました！ログインしてください。');
        setActiveTab('login');
        setPassword('');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="閉じる">
          &times;
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            ログイン
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            新規登録
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          {localSuccess && <div className="auth-success">{localSuccess}</div>}

          <div className="form-field">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              autoComplete="username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? '送信中...' : activeTab === 'login' ? 'ログイン' : '新規アカウント作成'}
          </button>
        </form>
      </div>
    </div>
  );
}
