import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthDialog, AuthDialogMode } from '../Auth/AuthDialog';
import { MyButton } from '../common/button/Button';
import { SegmentedNavigation } from '../common/SegmentedNavigation';
import { useAuth } from '../../hooks/Auth/useAuth';
import './Header.css';

function Header() {
  const { user, loading, logout } = useAuth();
  const [dialogMode, setDialogMode] = useState<AuthDialogMode | null>(null);

  return (
    <>
      <header className="header-container">
        <div className="header-alignment">
          <Link className="header-title" to="/">Competitive Programming Assistant</Link>
          <div className="header-button-alignment">
            {loading ? (
              <span className="header-auth-state">認証確認中…</span>
            ) : user ? (
              <>
                <span className="header-auth-state">{user.username}</span>
                <MyButton color="#475569" onClick={() => void logout()}>ログアウト</MyButton>
              </>
            ) : (
              <>
                <MyButton color="#334155" onClick={() => setDialogMode('register')}>新規登録</MyButton>
                <MyButton color="green" onClick={() => setDialogMode('login')}>ログイン</MyButton>
              </>
            )}
          </div>
        </div>
        <SegmentedNavigation
          className="header-navigation"
          label="ページ切替"
          options={[
            { to: '/', label: 'Home', end: true },
            { to: '/graph', label: 'Graph' },
            { to: '/array', label: 'Array' },
            { to: '/random-gen', label: 'Random Gen' },
          ]}
        />
      </header>
      {dialogMode && (
        <AuthDialog
          mode={dialogMode}
          onModeChange={setDialogMode}
          onClose={() => setDialogMode(null)}
        />
      )}
    </>
  );
}

export default Header;
