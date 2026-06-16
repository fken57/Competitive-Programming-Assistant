import Header from './components/header/header';
import { MainRouter } from "./components/router/MainRouter";
import { Footer } from './components/footer/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';

export default function App() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Header />
      <div style={{ flex: 1 }}>
        <MainRouter />
      </div>
      <Footer />
    </div>
  );

}