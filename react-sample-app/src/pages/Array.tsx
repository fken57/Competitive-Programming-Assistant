import React, { useState } from 'react';
import { ArrayInputFormOutline } from '../components/Array/ArrayInputFormOutline';
import { ArrayAlgorithmFormOutline } from '../components/Array/ArrayAlgorithmFormOutline';
import './Array.css';

const ArrayPage: React.FC = () => {
  const [values, setValues] = useState<number[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [arrayRevision, setArrayRevision] = useState(0);

  const handleSubmit = (nextValues: number[]) => {
    setValues(nextValues);
    setErrorMessage('');
    setArrayRevision((revision) => revision + 1);
  };

  const handleInvalid = (message: string) => {
    setValues(null);
    setErrorMessage(message);
    setArrayRevision((revision) => revision + 1);
  };

  return (
    <main className="array-page">
      <section className="array-page-header">
        <h1>Array Analyzer</h1>
        <p>整数配列の性質を静的アルゴリズムで解析します。</p>
        <ArrayInputFormOutline onSubmit={handleSubmit} onInvalid={handleInvalid} />
        {errorMessage && <div className="array-page-error">入力エラー: {errorMessage}</div>}
        {values && (
          <div className="array-loaded-summary">
            <strong>{values.length}要素を読み込みました。</strong>
            <pre>{values.join(' ')}</pre>
          </div>
        )}
      </section>

      {values && (
        <ArrayAlgorithmFormOutline
          key={arrayRevision}
          category="static"
          values={values}
        />
      )}
    </main>
  );
};

export default ArrayPage;
