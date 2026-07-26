import React, { useState } from 'react';
import { LabeledField } from '../../../common/LabeledField';
import {
  ARRAY_QUERY_ENDPOINTS,
  ArrayQueryResponse,
} from '../../../../util/ArrayQueryApi';
import { ArrayQueryCard, ArrayQueryResultBlock } from './ArrayQueryCard';
import './ArrayQueryAlgorithms.css';

type ArrayQueryAlgorithmsProps = {
  values: number[];
};

type IntegerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

function IntegerField({ label, value, onChange, hint }: IntegerFieldProps) {
  return (
    <LabeledField label={label} hint={hint}>
      <input
        type="number"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </LabeledField>
  );
}

function parseIntegerParameter(rawValue: string, label: string): number {
  if (!/^-?\d+$/.test(rawValue)) {
    throw new Error(`${label}は整数で入力してください。`);
  }
  const value = Number(rawValue);
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label}は安全な整数の範囲で入力してください。`);
  }
  return value;
}

function CountResult({ data }: { data: ArrayQueryResponse }) {
  return <ArrayQueryResultBlock label="件数" value={String(data.count ?? '')} />;
}

function StaticRangeSumCard({ values }: ArrayQueryAlgorithmsProps) {
  const [leftInput, setLeftInput] = useState('1');
  const [rightInput, setRightInput] = useState(String(values.length));

  return (
    <ArrayQueryCard
      title="静的区間和"
      description="指定した区間の和を累積和で求めます。"
      endpoint={ARRAY_QUERY_ENDPOINTS.STATIC_RANGE_SUM_QUERY}
      parameterKey={`${leftInput}:${rightInput}`}
      parameterFields={(
        <>
          <IntegerField
            label="左端（1-based）"
            value={leftInput}
            onChange={setLeftInput}
          />
          <IntegerField
            label="右端（1-based、両端を含む）"
            value={rightInput}
            onChange={setRightInput}
          />
        </>
      )}
      buildRequest={() => {
        const left = parseIntegerParameter(leftInput, '左端');
        const right = parseIntegerParameter(rightInput, '右端');
        if (left < 1 || left > values.length) {
          throw new Error(`左端は1以上${values.length}以下で入力してください。`);
        }
        if (right < left || right > values.length) {
          throw new Error(`右端は左端以上${values.length}以下で入力してください。`);
        }
        return { values, left: left - 1, right_exclusive: right };
      }}
      renderResult={(data) => <ArrayQueryResultBlock label="区間和" value={String(data.sum ?? '')} />}
    />
  );
}

function SubarraySumEqualCard({ values }: ArrayQueryAlgorithmsProps) {
  const [targetInput, setTargetInput] = useState('0');
  return (
    <ArrayQueryCard
      title="部分配列和 = K の個数"
      description="和が目標値Kに等しい連続部分配列を数えます。"
      endpoint={ARRAY_QUERY_ENDPOINTS.COUNT_SUBARRAYS_SUM_EQUAL_K}
      parameterKey={targetInput}
      parameterFields={(
        <IntegerField label="目標値 K" value={targetInput} onChange={setTargetInput} />
      )}
      buildRequest={() => ({ values, target: parseIntegerParameter(targetInput, '目標値K') })}
      renderResult={(data) => <CountResult data={data} />}
    />
  );
}

function SubarrayModuloCard({ values }: ArrayQueryAlgorithmsProps) {
  const [modulusInput, setModulusInput] = useState('1');
  const [remainderInput, setRemainderInput] = useState('0');
  return (
    <ArrayQueryCard
      title="部分配列和 mod M = R の個数"
      description="和をMで割った余りがRになる連続部分配列を数えます。負の累積和も正規化します。"
      endpoint={ARRAY_QUERY_ENDPOINTS.COUNT_SUBARRAYS_SUM_MOD_EQUAL_R}
      parameterKey={`${modulusInput}:${remainderInput}`}
      parameterFields={(
        <>
          <IntegerField label="法 M" value={modulusInput} onChange={setModulusInput} />
          <IntegerField
            label="余り R"
            value={remainderInput}
            onChange={setRemainderInput}
            hint="0以上M未満"
          />
        </>
      )}
      buildRequest={() => {
        const modulus = parseIntegerParameter(modulusInput, '法M');
        const remainder = parseIntegerParameter(remainderInput, '余りR');
        if (modulus <= 0) {
          throw new Error('法Mは1以上で入力してください。');
        }
        if (remainder < 0 || remainder >= modulus) {
          throw new Error('余りRは0以上M未満で入力してください。');
        }
        return { values, modulus, remainder };
      }}
      renderResult={(data) => <CountResult data={data} />}
    />
  );
}

type FixedWindowCardProps = ArrayQueryAlgorithmsProps & {
  kind: 'minimum' | 'maximum';
};

function FixedWindowCard({ values, kind }: FixedWindowCardProps) {
  const [windowInput, setWindowInput] = useState('1');
  const isMinimum = kind === 'minimum';
  return (
    <ArrayQueryCard
      title={isMinimum ? '固定長窓の最小値' : '固定長窓の最大値'}
      description={`長さWの各連続区間について${isMinimum ? '最小値' : '最大値'}を求めます。`}
      endpoint={isMinimum
        ? ARRAY_QUERY_ENDPOINTS.FIXED_WINDOW_MINIMUM
        : ARRAY_QUERY_ENDPOINTS.FIXED_WINDOW_MAXIMUM}
      parameterKey={windowInput}
      parameterFields={(
        <IntegerField
          label="窓幅 W"
          value={windowInput}
          onChange={setWindowInput}
          hint={`1以上${values.length}以下`}
        />
      )}
      buildRequest={() => {
        const windowSize = parseIntegerParameter(windowInput, '窓幅W');
        if (windowSize < 1 || windowSize > values.length) {
          throw new Error(`窓幅Wは1以上${values.length}以下で入力してください。`);
        }
        return { values, window_size: windowSize };
      }}
      renderResult={(data) => (
        <ArrayQueryResultBlock
          label={isMinimum ? '各窓の最小値' : '各窓の最大値'}
          value={(isMinimum ? data.minimums : data.maximums)?.join(' ') ?? ''}
        />
      )}
    />
  );
}

function PairSumCard({ values }: ArrayQueryAlgorithmsProps) {
  const [targetInput, setTargetInput] = useState('0');
  return (
    <ArrayQueryCard
      title="和がK以下のペア数"
      description="配列のコピーをソートし、i < j かつ A[i] + A[j] ≤ K のペアを数えます。"
      endpoint={ARRAY_QUERY_ENDPOINTS.COUNT_PAIRS_SUM_AT_MOST_K_AFTER_SORT}
      parameterKey={targetInput}
      parameterFields={(
        <IntegerField label="上限 K" value={targetInput} onChange={setTargetInput} />
      )}
      buildRequest={() => ({ values, target: parseIntegerParameter(targetInput, '上限K') })}
      renderResult={(data) => <CountResult data={data} />}
    />
  );
}

function PairDifferenceCard({ values }: ArrayQueryAlgorithmsProps) {
  const [maxDifferenceInput, setMaxDifferenceInput] = useState('0');
  return (
    <ArrayQueryCard
      title="差の絶対値がK以下のペア数"
      description="配列のコピーをソートし、i < j かつ |A[i] - A[j]| ≤ K のペアを数えます。"
      endpoint={ARRAY_QUERY_ENDPOINTS.COUNT_PAIRS_ABS_DIFF_AT_MOST_K_AFTER_SORT}
      parameterKey={maxDifferenceInput}
      parameterFields={(
        <IntegerField
          label="差の上限 K"
          value={maxDifferenceInput}
          onChange={setMaxDifferenceInput}
        />
      )}
      buildRequest={() => {
        const maxDifference = parseIntegerParameter(maxDifferenceInput, '差の上限K');
        if (maxDifference < 0) {
          throw new Error('差の上限Kは0以上で入力してください。');
        }
        return { values, max_difference: maxDifference };
      }}
      renderResult={(data) => <CountResult data={data} />}
    />
  );
}

export function ArrayQueryAlgorithms({ values }: ArrayQueryAlgorithmsProps) {
  return (
    <div className="array-query-section">
      <div className="array-query-heading">
        <span className="array-category-badge">Query</span>
        <h1>配列Queryアルゴリズム</h1>
        <p>読み込んだ配列に追加パラメーターを指定して実行します。</p>
      </div>
      <div className="array-query-grid">
        <StaticRangeSumCard values={values} />
        <SubarraySumEqualCard values={values} />
        <SubarrayModuloCard values={values} />
        <FixedWindowCard values={values} kind="minimum" />
        <FixedWindowCard values={values} kind="maximum" />
        <PairSumCard values={values} />
        <PairDifferenceCard values={values} />
      </div>
    </div>
  );
}
