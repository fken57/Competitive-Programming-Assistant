import React, { useState } from 'react';
import { AuthDialog, AuthDialogMode } from '../Auth/AuthDialog';
import { MyButton } from '../common/button/Button';
import { useAuth } from '../../hooks/Auth/useAuth';
import './Header.css';

function Header() {
  const { user, loading, logout } = useAuth();
  const [dialogMode, setDialogMode] = useState<AuthDialogMode | null>(null);

  return (
    <>
      <header className="header-container">
        <div className="header-alignment">
          <h1 className="header-title">Competitive Programming Assistant</h1>
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
