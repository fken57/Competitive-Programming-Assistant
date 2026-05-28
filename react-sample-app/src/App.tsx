import './assets/styles/app.css';
import Home from './pages/Home/Home';
import GraphPage from './pages/Graph/Graph';
import { useState } from 'react';

type Page = 'home' | 'graph';

function App() {
  const [page, setPage] = useState<Page>('home');

  if (page === 'graph') {
    return <GraphPage onBack={() => setPage('home')} />;
  }

  return <Home onOpenGraph={() => setPage('graph')} />;
}

export default App;
