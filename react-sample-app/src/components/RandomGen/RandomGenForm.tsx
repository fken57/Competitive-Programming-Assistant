import React, { FormEvent, useState } from 'react';
import { GenerationRecipe, StructureType } from '../../types/RandomGen';
import { LabeledField } from '../common/LabeledField';
import { SegmentedControl } from '../common/SegmentedControl';
import { ToggleSwitch } from '../common/ToggleSwitch';
import {
  MAX_RANDOM_GEN_N,
  createRandomSeed,
  validateGraphSettings,
} from '../../util/randomGenValidation';
import './RandomGen.css';

type Props = {
  loading: boolean;
  onGenerate: (recipe: GenerationRecipe) => void;
};

const CASE_OPTIONS: Record<StructureType, Array<{ value: string; label: string }>> = {
  array: [
    ['uniform', '一様ランダム'], ['all_same', '全要素同一'],
    ['many_duplicates', '重複多数'], ['sorted_asc', '昇順'],
    ['sorted_desc', '降順'], ['almost_sorted', 'ほぼソート済み'],
    ['zero_heavy', '0を多く含む'], ['min_max_heavy', '最小値・最大値中心'],
    ['alternating', '交互配列'],
  ].map(([value, label]) => ({ value, label })),
  tree: [
    ['random', 'ランダム木'], ['path', 'パス'], ['star', 'スター'],
    ['binary_like', '二分木風'], ['broom', 'ほうき型'],
  ].map(([value, label]) => ({ value, label })),
  graph: [
    ['random_sparse', '疎グラフ'], ['random_dense', '密グラフ'],
    ['tree', '木'], ['dag', 'DAG'], ['cycle_heavy', '閉路多数'],
    ['disconnected', '非連結'],
  ].map(([value, label]) => ({ value, label })),
};

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <LabeledField label={label}>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </LabeledField>
  );
}

export function RandomGenForm({ loading, onGenerate }: Props) {
  const [structureType, setStructureType] = useState<StructureType>('array');
  const [caseTypes, setCaseTypes] = useState<Record<StructureType, string>>({
    array: 'uniform',
    tree: 'random',
    graph: 'random_sparse',
  });
  const [seed, setSeed] = useState('123456789');
  const [n, setN] = useState(10);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [indexBase, setIndexBase] = useState<0 | 1>(1);
  const [hasT, setHasT] = useState(false);
  const [testCount, setTestCount] = useState(3);
  const [weighted, setWeighted] = useState(false);
  const [minWeight, setMinWeight] = useState(1);
  const [maxWeight, setMaxWeight] = useState(100);
  const [shuffleLabels, setShuffleLabels] = useState(false);
  const [m, setM] = useState(12);
  const [directed, setDirected] = useState(false);
  const [connected, setConnected] = useState(true);
  const [allowSelfLoop, setAllowSelfLoop] = useState(false);
  const [allowMultiEdge, setAllowMultiEdge] = useState(false);
  const [validationError, setValidationError] = useState('');

  const caseType = caseTypes[structureType];

  const handleStructureChange = (next: StructureType) => {
    setStructureType(next);
    setValidationError('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d+$/.test(seed)) {
      setValidationError('seedは0以上の整数にしてください');
      return;
    }
    if (!Number.isInteger(n) || n < 1 || n > MAX_RANDOM_GEN_N) {
      setValidationError(`Nは1から${MAX_RANDOM_GEN_N}の整数にしてください`);
      return;
    }
    if (hasT && (!Number.isInteger(testCount) || testCount < 1 || testCount > 100)) {
      setValidationError('Tは1から100の整数にしてください');
      return;
    }
    if (minValue < -1_000_000_000 || maxValue > 1_000_000_000 || minValue > maxValue) {
      setValidationError('値は -10^9 <= minValue <= maxValue <= 10^9 にしてください');
      return;
    }
    if (caseType === 'zero_heavy' && (minValue > 0 || maxValue < 0)) {
      setValidationError('zero_heavyの値域には0を含めてください');
      return;
    }
    if (weighted
      && (minWeight < -1_000_000_000 || maxWeight > 1_000_000_000 || minWeight > maxWeight)) {
      setValidationError('重みは -10^9 <= minWeight <= maxWeight <= 10^9 にしてください');
      return;
    }
    if (structureType === 'graph') {
      const graphError = validateGraphSettings({
        n,
        m,
        graphType: caseType,
        directed,
        connected,
        allowSelfLoop,
        allowMultiEdge,
      });
      if (graphError) {
        setValidationError(graphError);
        return;
      }
    }

    const params: Record<string, unknown> = { N: n };
    if (hasT) params.testCount = testCount;
    if (structureType === 'array') {
      params.minValue = minValue;
      params.maxValue = maxValue;
    }
    if (structureType === 'tree') {
      Object.assign(params, { weighted, shuffleLabels });
      if (weighted) Object.assign(params, { minWeight, maxWeight });
    }
    if (structureType === 'graph') {
      Object.assign(params, {
        M: m,
        directed,
        connected,
        allowSelfLoop,
        allowMultiEdge,
        weighted,
      });
      if (weighted) Object.assign(params, { minWeight, maxWeight });
    }

    setValidationError('');
    onGenerate({
      generatorVersion: '0.1.0',
      rngAlgorithm: 'splitmix64-v1',
      seed,
      structureType,
      caseType,
      params,
      outputFormat: {
        indexBase: structureType === 'array' ? 1 : indexBase,
        hasT,
        lineBreakStyle: 'lf',
      },
    });
  };

  return (
    <form className="random-gen-form" onSubmit={handleSubmit}>
      <SegmentedControl
        className="random-gen-structure-tabs"
        legend="生成する構造"
        name="random-gen-structure"
        value={structureType}
        options={[
          { value: 'array', label: '配列' },
          { value: 'tree', label: '木' },
          { value: 'graph', label: 'グラフ' },
        ]}
        onChange={handleStructureChange}
      />

      <div className="random-gen-form-grid">
        <LabeledField label="ケース種別">
          <select
            value={caseType}
            onChange={(event) => setCaseTypes((current) => ({
              ...current,
              [structureType]: event.target.value,
            }))}
          >
            {CASE_OPTIONS[structureType].map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </LabeledField>
        <NumberInput label="N" value={n} onChange={setN} />
        {structureType === 'graph' && <NumberInput label="M" value={m} onChange={setM} />}
        {structureType === 'array' && (
          <>
            <NumberInput label="最小値" value={minValue} onChange={setMinValue} />
            <NumberInput label="最大値" value={maxValue} onChange={setMaxValue} />
          </>
        )}
        {structureType !== 'array' && (
          <LabeledField label="頂点番号">
            <select value={indexBase} onChange={(event) => setIndexBase(Number(event.target.value) as 0 | 1)}>
              <option value={1}>1-based</option>
              <option value={0}>0-based</option>
            </select>
          </LabeledField>
        )}
      </div>

      {structureType === 'tree' && (
        <div className="random-gen-options">
          <ToggleSwitch label="ラベルをシャッフル" checked={shuffleLabels} onChange={setShuffleLabels} />
        </div>
      )}
      {structureType === 'graph' && (
        <div className="random-gen-options">
          <ToggleSwitch label="有向" checked={directed} onChange={setDirected} />
          <ToggleSwitch label="連結" checked={connected} onChange={setConnected} />
          <ToggleSwitch label="自己ループを許可" checked={allowSelfLoop} onChange={setAllowSelfLoop} />
          <ToggleSwitch label="多重辺を許可" checked={allowMultiEdge} onChange={setAllowMultiEdge} />
        </div>
      )}
      {structureType !== 'array' && (
        <div className="random-gen-options random-gen-weight-options">
          <ToggleSwitch label="重み付き" checked={weighted} onChange={setWeighted} />
          {weighted && (
            <>
              <NumberInput label="最小重み" value={minWeight} onChange={setMinWeight} />
              <NumberInput label="最大重み" value={maxWeight} onChange={setMaxWeight} />
            </>
          )}
        </div>
      )}

      <div className="random-gen-seed-row">
        <LabeledField label="seed">
          <input value={seed} onChange={(event) => setSeed(event.target.value)} />
        </LabeledField>
        <button type="button" onClick={() => setSeed(createRandomSeed())}>seedをランダム生成</button>
      </div>

      <div className="random-gen-options">
        <ToggleSwitch label="Tを付ける" checked={hasT} onChange={setHasT} />
        {hasT && <NumberInput label="T" value={testCount} onChange={setTestCount} />}
      </div>

      {validationError && <p className="random-gen-error" role="alert">{validationError}</p>}
      <button className="random-gen-primary" disabled={loading} type="submit">
        {loading ? '生成中…' : '入力を生成'}
      </button>
    </form>
  );
}
