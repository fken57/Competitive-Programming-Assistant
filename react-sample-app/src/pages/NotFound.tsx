import React from 'react';
import { Link } from 'react-router-dom';
import { NotFoundGraph } from '../components/Graph/NotFoundGraph';
import './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">Oops! 404</h1>
        <p className="not-found-desc">
          お探しのページは見つかりませんでした。<br/>
          ノードを引っ張って遊んでから、ホームに戻りましょう。
        </p>
        <Link to="/" className="not-found-home-button">
          ホームへ戻る
        </Link>
      </div>
      <div className="not-found-graph-area">
        <NotFoundGraph />
      </div>
    </div>
  );
};

export default NotFound;
