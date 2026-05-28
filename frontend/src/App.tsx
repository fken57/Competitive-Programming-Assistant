import { useState } from 'react';
import './assets/styles/index.css';
import './assets/styles/app.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AuthModal from './features/auth/components/AuthModal';

// Pages
import Home from './pages/Home/Home';
import GraphPage from './pages/Graph/Graph';
import ArrayPage from './pages/Array/Array';
import StringPage from './pages/String/String';

// Hooks
import { useAuth } from './features/auth/hooks/useAuth';

type Page = 'home' | 'graph' | 'array' | 'string';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const auth = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'graph':
        return <GraphPage onBack={() => setCurrentPage('home')} />;
      case 'array':
        return <ArrayPage />;
      case 'string':
        return <StringPage />;
      case 'home':
      default:
        return <Home onNavigate={setCurrentPage} onOpenAuth={() => setIsAuthOpen(true)} user={auth.user} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar
        user={auth.user}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={auth.logout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <div className="main-content">{renderPage()}</div>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        authActions={auth}
      />
    </div>
  );
}

export default App;
