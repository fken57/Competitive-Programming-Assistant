import { useState, useEffect, useRef } from 'react';

export default function StringPage() {
  const [stringInput, setStringInput] = useState("abaabaa");
  const [mode, setMode] = useState<'z' | 'kmp'>('z');
  const [speed, setSpeed] = useState(400); // step duration in ms

  // Animation states
  const [animating, setAnimating] = useState(false);
  const [zValues, setZValues] = useState<number[]>([]);
  const [lpsValues, setLpsValues] = useState<number[]>([]);
  
  // Highlight states during character-by-character loops
  const [prefixPointer, setPrefixPointer] = useState<number | null>(null);
  const [suffixPointer, setSuffixPointer] = useState<number | null>(null);
  const [matchStatus, setMatchStatus] = useState<'match' | 'mismatch' | 'idle'>('idle');
  const [activeSegment, setActiveSegment] = useState<number | null>(null); // current suffix index being computed

  const isCancelled = useRef(false);

  const resetAll = () => {
    isCancelled.current = true;
    setAnimating(false);
    setZValues(new Array(stringInput.length).fill(0));
    setLpsValues(new Array(stringInput.length).fill(0));
    setPrefixPointer(null);
    setSuffixPointer(null);
    setMatchStatus('idle');
    setActiveSegment(null);
  };

  useEffect(() => {
    resetAll();
  }, [stringInput, mode]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- ANIMATED Z-ALGORITHM SIMULATOR ---
  const runZAlgorithm = async () => {
    setAnimating(true);
    isCancelled.current = false;
    const n = stringInput.length;
    const z = new Array<number>(n).fill(0);
    z[0] = n; // Z[0] is always N by definition

    setZValues([...z]);
    setActiveSegment(0);
    await sleep(speed);

    let l = 0, r = 0;

    for (let i = 1; i < n; i++) {
      if (isCancelled.current) return;
      setActiveSegment(i);
      setZValues([...z]);

      // If within bounds, try to copy values from previous prefix
      if (i <= r) {
        const k = i - l;
        if (z[k] < r - i + 1) {
          z[i] = z[k];
          setZValues([...z]);
          await sleep(speed);
          continue;
        }
        z[i] = r - i + 1;
      }

      // Explicit comparison
      while (i + z[i] < n) {
        if (isCancelled.current) return;

        // Visual pointer indexes
        const prefIdx = z[i];
        const suffIdx = i + z[i];

        setPrefixPointer(prefIdx);
        setSuffixPointer(suffIdx);
        setMatchStatus('idle');
        await sleep(speed);

        if (stringInput[prefIdx] === stringInput[suffIdx]) {
          setMatchStatus('match');
          z[i]++;
          setZValues([...z]);
          await sleep(speed);
        } else {
          setMatchStatus('mismatch');
          await sleep(speed);
          break;
        }
      }

      // Update Z-box boundaries
      if (i + z[i] - 1 > r) {
        l = i;
        r = i + z[i] - 1;
      }
    }

    setPrefixPointer(null);
    setSuffixPointer(null);
    setMatchStatus('idle');
    setActiveSegment(null);
    setAnimating(false);
  };

  // --- ANIMATED KMP LPS ARRAY SIMULATOR ---
  const runKMPAlgorithm = async () => {
    setAnimating(true);
    isCancelled.current = false;
    const n = stringInput.length;
    const lps = new Array<number>(n).fill(0);

    setLpsValues([...lps]);
    setActiveSegment(0);
    await sleep(speed);

    let len = 0;
    let i = 1;

    while (i < n) {
      if (isCancelled.current) return;
      setActiveSegment(i);
      
      setPrefixPointer(len);
      setSuffixPointer(i);
      setMatchStatus('idle');
      await sleep(speed);

      if (stringInput[i] === stringInput[len]) {
        setMatchStatus('match');
        len++;
        lps[i] = len;
        setLpsValues([...lps]);
        await sleep(speed);
        i++;
      } else {
        setMatchStatus('mismatch');
        await sleep(speed);

        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          setLpsValues([...lps]);
          i++;
        }
      }
    }

    setPrefixPointer(null);
    setSuffixPointer(null);
    setMatchStatus('idle');
    setActiveSegment(null);
    setAnimating(false);
  };

  const handleRun = () => {
    if (animating) return;
    if (mode === 'z') runZAlgorithm();
    else runKMPAlgorithm();
  };

  return (
    <main className="string-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">STRING ALGORITHM SIMULATOR</p>
          <h1>文字列アルゴリズム</h1>
          <p className="page-lead">
            Z-algorithm（最長共通接頭辞 LCP の計算）や、KMP法（最長接頭辞接尾辞 LPS 配列の構築）の遷移プロセスを1文字単位でアニメーション化します。
          </p>
        </div>
      </header>

      <div className="string-layout">
        {/* Left panel: controls */}
        <section className="control-panel">
          <div className="control-section">
            <h3>アルゴリズム選択</h3>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${mode === 'z' ? 'active' : ''}`}
                onClick={() => setMode('z')}
              >
                Z-algorithm
              </button>
              <button
                className={`toggle-btn ${mode === 'kmp' ? 'active' : ''}`}
                onClick={() => setMode('kmp')}
              >
                KMP LPS 配列
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>文字列入力</h3>
            <div className="form-field">
              <label htmlFor="string-data">解析対象の文字列 (S)</label>
              <input
                id="string-data"
                type="text"
                value={stringInput}
                onChange={(e) => setStringInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="abaabaa"
                maxLength={20}
              />
            </div>
            <p className="panel-hint">
              ※ アルファベット・数字のみ入力可能です（最大20文字）。
            </p>
          </div>

          <div className="control-section">
            <h3>可視化設定</h3>
            <div className="form-field">
              <label htmlFor="string-speed-slider">実行速度 ({speed}ms)</label>
              <input
                id="string-speed-slider"
                type="range"
                min="100"
                max="1200"
                step="50"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </div>

            <button className="btn btn-primary" onClick={handleRun} style={{ width: '100%', marginTop: '8px' }} disabled={animating}>
              {animating ? 'シミュレート中...' : 'アニメーション実行'}
            </button>
            
            <button className="btn btn-secondary" onClick={resetAll} style={{ width: '100%', marginTop: '8px' }}>
              アニメーションをリセット
            </button>
          </div>
        </section>

        {/* Right panel: visual displays */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="string-visualizer-container">
            <div className="canvas-title">
              <span>🔠 キャラクターボックス & 結果</span>
            </div>

            {/* Character grid */}
            <div className="string-box-row">
              {stringInput.split('').map((char, idx) => {
                // Determine CSS highlighting classes based on algorithm loop pointers
                const isPrefix = prefixPointer === idx;
                const isSuffix = suffixPointer === idx;
                const isActive = activeSegment === idx;

                let borderClass = "";
                if (isPrefix) borderClass = "highlighted"; // Prefix matches
                else if (isSuffix) {
                  if (matchStatus === 'match') borderClass = "matched";
                  else if (matchStatus === 'mismatch') borderClass = "mismatched";
                  else borderClass = "highlighted";
                }

                return (
                  <div
                    key={idx}
                    className={`char-box ${borderClass}`}
                    style={{
                      borderWidth: isActive ? '3.5px' : undefined,
                      borderColor: isActive ? 'var(--color-primary)' : undefined,
                    }}
                  >
                    <span className="char-box-index">{idx}</span>
                    <span style={{ fontSize: '1.4rem' }}>{char}</span>
                    
                    {/* Render matching algorithm values dynamically */}
                    <span className={`char-box-value ${mode === 'z' ? 'z-val' : ''}`}>
                      {mode === 'z' ? zValues[idx] || 0 : lpsValues[idx] || 0}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="panel-hint" style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: 'var(--color-highlight)' }}>● 比較キャラクター</span>
              <span style={{ color: 'var(--color-primary)', marginLeft: '14px' }}>● 計算処理中のインデックス</span>
              <span style={{ color: 'var(--color-secondary)', marginLeft: '14px' }}>● ミスマッチ</span>
            </div>
          </div>

          {/* Theoretical dynamic visual summary cards */}
          {mode === 'z' ? (
            <div className="metrics-panel">
              <div className="metric-card">
                <h4>Z-algorithm 理論概要</h4>
                <div className="metric-value highlight" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                  Z[i] = S[i...] と S 全体の最長共通接頭辞 (LCP) の長さ
                </div>
                <div className="metric-details" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                  Z-algorithm を用いると、文字列検索や部分文字列パターンの全一致検出が <strong>O(N)</strong> の時間計算量で行えます。<br />
                  Z-box と呼ばれるマッチング済の右端範囲 [L, R] を引き継ぐことで、線形時間で全インデックスのZ値を埋めています。
                </div>
              </div>
            </div>
          ) : (
            <div className="metrics-panel">
              <div className="metric-card">
                <h4>KMP LPS (最長接頭辞接尾辞) 配列</h4>
                <div className="metric-value highlight" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                  &pi;[i] = S[0...i] における、接頭辞と接尾辞が一致する最長長
                </div>
                <div className="metric-details" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                  KMP法（Knuth-Morris-Pratt）はこの LPS 情報を利用し、文字列検索で不一致（ミスマッチ）が生じた際、
                  ポインタを先頭まで戻さずに <strong>&pi;[len-1]</strong> へスキップさせ、<strong>O(N + M)</strong> の高速検索を達成します。
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
