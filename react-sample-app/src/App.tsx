import Header from './components/header/header';
import { MainRouter } from "./components/router/MainRouter";
import { Footer } from './components/footer/Footer';

export default function App() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <MainRouter />
      </div>
      <Footer />
    </div>
  );

}