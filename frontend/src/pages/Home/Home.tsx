import { LoggedInUser } from '../../features/auth/hooks/useAuth';

type HomeProps = {
  onNavigate: (page: 'home' | 'graph' | 'array' | 'string') => void;
  onOpenAuth: () => void;
  user: LoggedInUser | null;
};

export default function Home({ onNavigate, onOpenAuth, user }: HomeProps) {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-eyebrow">COMPETITIVE PROGRAMMING ASSISTANT</p>
          <h1>見えないものを見えるに変える</h1>
          <p className="home-lead">
            競争プログラミングでのデータ構造やアルゴリズムを可視化するツールです。グラフ、配列、文字列などの構造をリアルタイムに操作・理解することができ、デバッグや計算量の直感的理解を助けます。
          </p>
          
          <div className="home-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('graph')}>
              グラフツールを使う
            </button>
            {!user ? (
              <button className="btn btn-secondary" onClick={onOpenAuth}>
                アカウント作成
              </button>
            ) : (
              <div className="user-badge">
                {user.username} としてログイン中
              </div>
            )}
          </div>
        </div>

        <div className="home-hero__visual">
          <div className="home-card-grid">
            {/* Graph Card */}
            <article className="home-card graph-card" onClick={() => onNavigate('graph')}>
              <div className="card-icon-container">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <circle cx="12" cy="5" r="3" />
                  <circle cx="5" cy="18" r="3" />
                  <circle cx="19" cy="18" r="3" />
                  <line x1="12" y1="8" x2="6.5" y2="15.5" strokeDasharray="2" />
                  <line x1="12" y1="8" x2="17.5" y2="15.5" strokeDasharray="2" />
                  <line x1="8" y1="18" x2="16" y2="18" />
                </svg>
              </div>
              <h2>グラフ</h2>
              <p>BFS、強連結成分（SCC）、二部グラフ、最小共通祖先（LCA）、ダブリングなどを視覚化します。</p>
            </article>

            {/* Array Card */}
            <article className="home-card array-card" onClick={() => onNavigate('array')}>
              <div className="card-icon-container">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-highlight)" strokeWidth="2">
                  <rect x="3" y="12" width="4" height="8" rx="1" fill="rgba(251, 191, 36, 0.2)" />
                  <rect x="10" y="6" width="4" height="14" rx="1" fill="rgba(251, 191, 36, 0.2)" />
                  <rect x="17" y="10" width="4" height="10" rx="1" fill="rgba(251, 191, 36, 0.2)" />
                </svg>
              </div>
              <h2>配列</h2>
              <p>ソートアルゴリズムの挙動や、区間クエリで威力を発揮する累積和の仕組みを可視化します。</p>
            </article>

            {/* String Card */}
            <article className="home-card string-card" onClick={() => onNavigate('string')}>
              <div className="card-icon-container">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                  <path d="M4 19h16" />
                  <path d="M6.5 15h11" />
                  <path d="M12 4L6 19M12 4l6 15" />
                </svg>
              </div>
              <h2>文字列</h2>
              <p>Z-algorithm の最長共通プレフィックス（LCP）や KMP 法の LPS 配列遷移をステップ単位で追跡します。</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
