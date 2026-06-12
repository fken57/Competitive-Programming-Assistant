import{useState} from "react"
import Home from './pages/Home'
import Header from './components/header/header'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'graph'>('home');
  const [inputText, setInputText] = useState('');

  const handleAnalyze = () => {
    if(!inputText.trim()) {
      alert('入力内容を確認してください。');
      return;
    }
    alert('分析が完了しました。');
    console.log("入力された文字列:\n", inputText);
  };

  return (
    <div>
      <Header />
      {currentScreen === 'home' && (
        <>
          <Home />
        </>
      )}
    </div>
  );


}