import { useState, useEffect, useRef, useMemo } from 'react';

export default function ArrayPage() {
  const [arrayInput, setArrayInput] = useState("6, 2, 8, 3, 5, 1, 7, 4");
  const [array, setArray] = useState<number[]>([]);
  const [initialArray, setInitialArray] = useState<number[]>([]);
  
  // Sorting simulation states
  const [sortAlgo, setSortAlgo] = useState<'bubble' | 'selection' | 'insertion'>('bubble');
  const [comparingIdxs, setComparingIdxs] = useState<number[]>([]);
  const [swappingIdxs, setSwappingIdxs] = useState<number[]>([]);
  const [sortedIdxs, setSortedIdxs] = useState<Set<number>>(new Set());
  const [sorting, setSorting] = useState(false);
  const [speed, setSpeed] = useState(400); // ms per step

  // Cumulative Sum states
  const [activeTab, setActiveTab] = useState<'sort' | 'csum'>('sort');
  const [csumRangeL, setCsumRangeL] = useState(1);
  const [csumRangeR, setCsumRangeR] = useState(4);
  const [csumHighlightedA, setCsumHighlightedA] = useState<Set<number>>(new Set());
  const [csumHighlightedS, setCsumHighlightedS] = useState<Set<number>>(new Set());

  // Ref to cancel animation on reset
  const isSortingCancelled = useRef(false);

  // Parse input to array
  const resetArray = () => {
    isSortingCancelled.current = true;
    setSorting(false);
    const parsed = arrayInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const capped = parsed.slice(0, 15); // limit length for screen aesthetic
    setArray(capped);
    setInitialArray([...capped]);
    setComparingIdxs([]);
    setSwappingIdxs([]);
    setSortedIdxs(new Set());
    
    // Reset csum selections
    setCsumHighlightedA(new Set());
    setCsumHighlightedS(new Set());
  };

  useEffect(() => {
    resetArray();
  }, [arrayInput]);

  // Helper delay function
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- ANIMATED BUBBLE SORT ---
  const bubbleSort = async () => {
    setSorting(true);
    isSortingCancelled.current = false;
    const arr = [...array];
    const n = arr.length;
    const sorted = new Set<number>();

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (isSortingCancelled.current) return;

        // Set comparing indexes
        setComparingIdxs([j, j + 1]);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          // Trigger swap
          setSwappingIdxs([j, j + 1]);
          const tmp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = tmp;
          setArray([...arr]);
          await sleep(speed);
          setSwappingIdxs([]);
        }
      }
      // j = n - i - 1 is now sorted
      sorted.add(n - i - 1);
      setSortedIdxs(new Set(sorted));
    }
    setComparingIdxs([]);
    setSorting(false);
  };

  // --- ANIMATED SELECTION SORT ---
  const selectionSort = async () => {
    setSorting(true);
    isSortingCancelled.current = false;
    const arr = [...array];
    const n = arr.length;
    const sorted = new Set<number>();

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (isSortingCancelled.current) return;

        setComparingIdxs([minIdx, j]);
        await sleep(speed);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        setSwappingIdxs([i, minIdx]);
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        setArray([...arr]);
        await sleep(speed);
        setSwappingIdxs([]);
      }

      sorted.add(i);
      setSortedIdxs(new Set(sorted));
    }
    sorted.add(n - 1);
    setSortedIdxs(new Set(sorted));
    setComparingIdxs([]);
    setSorting(false);
  };

  // --- ANIMATED INSERTION SORT ---
  const insertionSort = async () => {
    setSorting(true);
    isSortingCancelled.current = false;
    const arr = [...array];
    const n = arr.length;
    const sorted = new Set<number>([0]);

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;

      setComparingIdxs([i]);
      await sleep(speed);

      while (j >= 0 && arr[j] > key) {
        if (isSortingCancelled.current) return;

        setComparingIdxs([j, j + 1]);
        setSwappingIdxs([j, j + 1]);
        
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(speed);
        
        j--;
        setSwappingIdxs([]);
      }
      arr[j + 1] = key;
      setArray([...arr]);
      
      // Mark up to current index as sorted-ish
      for (let k = 0; k <= i; k++) {
        sorted.add(k);
      }
      setSortedIdxs(new Set(sorted));
    }
    setComparingIdxs([]);
    setSorting(false);
  };

  const handleSort = () => {
    if (sorting) return;
    if (sortAlgo === 'bubble') bubbleSort();
    else if (sortAlgo === 'selection') selectionSort();
    else insertionSort();
  };

  // --- CUMULATIVE SUM CALCULATOR ---
  const cumulativeSums = useMemo<number[]>(() => {
    const sums = [0];
    let running = 0;
    for (const val of initialArray) {
      running += val;
      sums.push(running);
    }
    return sums;
  }, [initialArray]);

  const runCumulativeSumQuery = () => {
    const l = Math.max(0, Math.min(csumRangeL, initialArray.length - 1));
    const r = Math.max(l, Math.min(csumRangeR, initialArray.length - 1));

    // Highlight elements A[L...R] in the original array
    const hA = new Set<number>();
    for (let i = l; i <= r; i++) {
      hA.add(i);
    }
    setCsumHighlightedA(hA);

    // Highlight prefix indices S[R+1] and S[L]
    const hS = new Set<number>([l, r + 1]);
    setCsumHighlightedS(hS);
  };

  // Calculate sum value of the active query range
  const computedRangeSumValue = useMemo(() => {
    if (csumHighlightedA.size === 0) return null;
    const l = csumRangeL;
    const r = csumRangeR;
    return cumulativeSums[r + 1] - cumulativeSums[l];
  }, [csumHighlightedA, cumulativeSums, csumRangeL, csumRangeR]);

  return (
    <main className="array-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">ARRAY ALGORITHM SIMULATOR</p>
          <h1>配列アルゴリズム</h1>
          <p className="page-lead">
            要素のソートプロセスや、累積和（Prefix Sum）を用いた区間合計クエリの高速計算を視覚化します。
          </p>
        </div>
      </header>

      <div className="array-layout">
        {/* Left Side: controls */}
        <section className="control-panel">
          <div className="control-section">
            <h3>可視化モード</h3>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${activeTab === 'sort' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('sort');
                  resetArray();
                }}
              >
                ソートシミュレーション
              </button>
              <button
                className={`toggle-btn ${activeTab === 'csum' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('csum');
                  resetArray();
                }}
              >
                累積和 (Prefix Sum)
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>配列データ</h3>
            <div className="form-field">
              <label htmlFor="array-input-list">配列データ (カンマ区切り)</label>
              <input
                id="array-input-list"
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                placeholder="4, 2, 7, 1, 3"
              />
            </div>
            <button className="btn btn-secondary" onClick={resetArray} style={{ width: '100%' }}>
              配列をリセット
            </button>
          </div>

          {activeTab === 'sort' ? (
            <div className="control-section">
              <h3>ソート設定</h3>
              <div className="form-field">
                <label>ソートアルゴリズム</label>
                <select value={sortAlgo} onChange={(e) => setSortAlgo(e.target.value as any)}>
                  <option value="bubble">バブルソート (Bubble Sort)</option>
                  <option value="selection">選択ソート (Selection Sort)</option>
                  <option value="insertion">挿入ソート (Insertion Sort)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="speed-slider">実行速度 ({speed}ms)</label>
                <input
                  id="speed-slider"
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
              </div>

              <button className="btn btn-primary" onClick={handleSort} style={{ width: '100%', marginTop: '8px' }} disabled={sorting}>
                {sorting ? 'ソート実行中...' : 'ソートを実行'}
              </button>
            </div>
          ) : (
            <div className="control-section">
              <h3>累積和クエリ (A[L] + ... + A[R])</h3>
              <div className="form-field">
                <label>区間開始インデックス L</label>
                <input
                  type="number"
                  min="0"
                  max={initialArray.length - 1}
                  value={csumRangeL}
                  onChange={(e) => setCsumRangeL(Math.max(0, Math.min(initialArray.length - 1, Number(e.target.value))))}
                />
              </div>
              
              <div className="form-field">
                <label>区間終了インデックス R</label>
                <input
                  type="number"
                  min="0"
                  max={initialArray.length - 1}
                  value={csumRangeR}
                  onChange={(e) => setCsumRangeR(Math.max(0, Math.min(initialArray.length - 1, Number(e.target.value))))}
                />
              </div>

              <button className="btn btn-primary" onClick={runCumulativeSumQuery} style={{ width: '100%', marginTop: '8px' }}>
                区間クエリを可視化
              </button>
            </div>
          )}
        </section>

        {/* Right Side: Visual canvas representation */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Visualizer Area */}
          <div className="array-visualizer-container">
            {activeTab === 'sort' ? (
              <>
                <div className="canvas-title" style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
                  <span>📊 ソートアニメーション</span>
                </div>
                
                <div className="array-bars-wrapper">
                  {array.map((val, idx) => {
                    const isComparing = comparingIdxs.includes(idx);
                    const isSwapping = swappingIdxs.includes(idx);
                    const isSorted = sortedIdxs.has(idx);

                    // Compute height scale relative to max value
                    const maxVal = Math.max(...initialArray, 1);
                    const heightPercent = `${Math.max(12, (val / maxVal) * 100)}%`;

                    let barClass = "";
                    if (isSwapping) barClass = "active";
                    else if (isComparing) barClass = "compared";

                    return (
                      <div key={idx} className="array-bar-column">
                        <span className="array-bar-val">{val}</span>
                        <div
                          className={`array-bar ${barClass}`}
                          style={{
                            height: heightPercent,
                            background: isSorted && !isComparing && !isSwapping
                              ? 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)' // Emerald for sorted
                              : undefined
                          }}
                        />
                        <span className="array-bar-idx">{idx}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="panel-hint" style={{ textAlign: 'center' }}>
                  <span style={{ color: 'var(--color-secondary)' }}>● 比較対象</span>
                  <span style={{ color: 'var(--color-highlight)', marginLeft: '14px' }}>● スワップ/代入</span>
                  <span style={{ color: '#10b981', marginLeft: '14px' }}>● 確定済要素</span>
                </div>
              </>
            ) : (
              <>
                <div className="canvas-title" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>
                  <span>📈 累積和配列 A と Prefix Sum 配列 S</span>
                </div>

                {/* Original array A */}
                <div style={{ width: '100%' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    元の配列 A
                  </p>
                  <div className="array-bars-wrapper" style={{ height: '120px', marginBottom: '24px' }}>
                    {initialArray.map((val, idx) => {
                      const isHighlighted = csumHighlightedA.has(idx);
                      const maxVal = Math.max(...initialArray, 1);
                      const heightPercent = `${Math.max(20, (val / maxVal) * 100)}%`;

                      return (
                        <div key={idx} className="array-bar-column">
                          <span className="array-bar-val" style={{ fontSize: '0.85rem' }}>{val}</span>
                          <div
                            className={`array-bar ${isHighlighted ? 'active' : ''}`}
                            style={{ height: heightPercent, borderRadius: '4px 4px 0 0' }}
                          />
                          <span className="array-bar-idx">{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cumulative array S */}
                <div style={{ width: '100%' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    累積和配列 S (S[i] = A[0] + ... + A[i-1])
                  </p>
                  <div className="array-bars-wrapper" style={{ height: '120px', marginBottom: '0' }}>
                    {cumulativeSums.map((val, idx) => {
                      const isHighlighted = csumHighlightedS.has(idx);
                      const maxVal = Math.max(...cumulativeSums, 1);
                      const heightPercent = `${Math.max(20, (val / maxVal) * 100)}%`;

                      return (
                        <div key={idx} className="array-bar-column">
                          <span className="array-bar-val" style={{ fontSize: '0.85rem' }}>{val}</span>
                          <div
                            className={`array-bar csum-bar ${isHighlighted ? 'active' : ''}`}
                            style={{
                              height: heightPercent,
                              borderRadius: '4px 4px 0 0',
                              // Color L highlight uniquely vs R+1
                              background: isHighlighted && idx === csumRangeL
                                ? 'linear-gradient(180deg, var(--color-secondary) 0%, rgba(244, 63, 94, 0.3) 100%)'
                                : undefined
                            }}
                          />
                          <span className="array-bar-idx" style={{ color: 'var(--color-primary)' }}>{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results panel */}
          {activeTab === 'csum' && computedRangeSumValue !== null && (
            <div className="metrics-panel">
              <div className="metric-card">
                <h4>累積和区間計算式</h4>
                <div className="metric-value highlight" style={{ fontSize: '1.4rem' }}>
                  A[{csumRangeL}] から A[{csumRangeR}] の合計 = {computedRangeSumValue}
                </div>
                <div className="metric-details" style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#a5b4fc', marginTop: '6px' }}>
                  計算式: S[{csumRangeR + 1}] - S[{csumRangeL}] <br />
                  &rArr; {cumulativeSums[csumRangeR + 1]} - {cumulativeSums[csumRangeL]} = {computedRangeSumValue} <br />
                  <span style={{ color: 'var(--text-muted)' }}>
                    ※ 元のループなら O(N) かかる区間和が、Sがあれば引き算するだけで O(1) で求まります！
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
