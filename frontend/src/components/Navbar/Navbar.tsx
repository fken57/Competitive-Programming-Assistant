import { LoggedInUser } from '../../features/auth/hooks/useAuth';

type NavbarProps = {
  user: LoggedInUser | null;
  onAuthClick: () => void;
  onLogout: () => void;
  currentPage: 'home' | 'graph' | 'array' | 'string';
  onPageChange: (page: 'home' | 'graph' | 'array' | 'string') => void;
};

export default function Navbar({ user, onAuthClick, onLogout, currentPage, onPageChange }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => onPageChange('home')}>
        CPA
      </div>

      <div className="navbar-menu">
        <span
          className={`navbar-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onPageChange('home')}
        >
          ホーム
        </span>
        <span
          className={`navbar-link ${currentPage === 'graph' ? 'active' : ''}`}
          onClick={() => onPageChange('graph')}
        >
          グラフ
        </span>
        <span
          className={`navbar-link ${currentPage === 'array' ? 'active' : ''}`}
          onClick={() => onPageChange('array')}
        >
          配列
        </span>
        <span
          className={`navbar-link ${currentPage === 'string' ? 'active' : ''}`}
          onClick={() => onPageChange('string')}
        >
          文字列
        </span>

        <div className="navbar-auth">
          {user ? (
            <>
              <div className="user-badge" title={`Created at ${user.time}`}>
                {user.username}
              </div>
              <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '6px 14px', borderRadius: '8px' }}>
                ログアウト
              </button>
            </>
          ) : (
            <button className="btn btn-nav-login" onClick={onAuthClick}>
              ログイン
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
