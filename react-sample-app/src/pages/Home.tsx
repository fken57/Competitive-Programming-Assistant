import Hyperlink from '../components/Hyperlink/Hyperlink';
import logo from '../assets/logo.svg';
import {Caption} from '../components/Home/caption'

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <Caption />
        <div className="home-hero__copy">
          <p className="home-eyebrow">Frontend structure</p>
          <h1>機能ごとに分けて、壊れにくい React アプリへ</h1>
          <p className="home-lead">
            共通部品、機能別コンポーネント、画面、型定義を役割ごとに分離するための土台です。
          </p>
          <div className="home-actions">
            <Hyperlink className="home-link home-link--primary" href="https://react.dev">
              React Docs
            </Hyperlink>
            <Hyperlink className="home-link" href="https://developer.mozilla.org/">
              MDN Web Docs
            </Hyperlink>
          </div>
        </div>
        <div className="home-hero__visual">
          <img src={logo} className="home-logo" alt="React logo" />
          <div className="home-card-grid">
            <article className="home-card">
              <h2>auth</h2>
              <p>ログイン・登録まわりの機能を閉じ込めます。</p>
            </article>
            <article className="home-card">
              <h2>graph</h2>
              <p>BFS や可視化など、グラフ系のロジックをまとめます。</p>
            </article>
            <article className="home-card">
              <h2>config</h2>
              <p>API ベース URL や環境変数の参照を置きます。</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
