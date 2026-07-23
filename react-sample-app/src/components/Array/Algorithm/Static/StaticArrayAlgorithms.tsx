import React from 'react';
import {
  ARRAY_ENDPOINTS,
  ArrayApiResponse,
} from '../../../../util/ArraySendApis';
import { ArrayAlgorithmCard, ArrayResultBlock } from './ArrayAlgorithmCard';
import './StaticArrayAlgorithms.css';

type StaticArrayAlgorithmsProps = {
  values: number[];
};

const formatValues = (values: Array<number | null> | undefined, emptyValue = '-') =>
  values?.map((value) => value === null ? emptyValue : String(value)).join(' ') ?? '';

function PrefixSumResult({ data }: { data: ArrayApiResponse }) {
  return <ArrayResultBlock label="累積和" value={formatValues(data.prefix_sum)} />;
}

function CompressionResult({ data }: { data: ArrayApiResponse }) {
  return (
    <>
      <ArrayResultBlock label="圧縮後（0-based）" value={formatValues(data.compressed_values)} />
      <ArrayResultBlock label="順位に対応する値" value={formatValues(data.distinct_values)} />
    </>
  );
}

function InversionResult({ data }: { data: ArrayApiResponse }) {
  return <ArrayResultBlock label="転倒数" value={String(data.inversion_count)} />;
}

function MexResult({ data }: { data: ArrayApiResponse }) {
  return <ArrayResultBlock label="MEX" value={String(data.mex)} />;
}

function RunLengthResult({ data }: { data: ArrayApiResponse }) {
  const runs = data.runs?.map((run) => `(${run.value}, ${run.count})`).join(' ') ?? '';
  return <ArrayResultBlock label="(値, 連続数)" value={runs} />;
}

function NextRightResult({ data }: { data: ArrayApiResponse }) {
  const displayIndices = data.next_indices?.map((index) => index < 0 ? -1 : index + 1);
  return (
    <>
      <ArrayResultBlock label="次の位置（1-based）" value={formatValues(displayIndices)} />
      <ArrayResultBlock label="次の値" value={formatValues(data.next_values)} />
    </>
  );
}

function LongestDistinctResult({ data }: { data: ArrayApiResponse }) {
  const left = data.left ?? 0;
  const rightExclusive = data.right_exclusive ?? 0;
  return (
    <>
      <ArrayResultBlock label="長さ" value={String(data.length)} />
      <ArrayResultBlock label="区間（1-based、両端を含む）" value={`${left + 1} ${rightExclusive}`} />
      <ArrayResultBlock label="部分配列" value={formatValues(data.values)} />
    </>
  );
}

export function StaticArrayAlgorithms({ values }: StaticArrayAlgorithmsProps) {
  return (
    <div className="static-array-section">
      <div className="static-array-heading">
        <span className="array-category-badge">静的</span>
        <h1>静的配列アルゴリズム</h1>
        <p>読み込んだ配列だけを使い、追加パラメーターなしで実行します。</p>
      </div>
      <div className="static-array-grid">
        <ArrayAlgorithmCard
          title="累積和"
          description="先頭に0を置いた累積和配列を構築します。"
          endpoint={ARRAY_ENDPOINTS.BUILD_PREFIX_SUM}
          values={values}
          renderResult={(data) => <PrefixSumResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="座標圧縮"
          description="値の大小関係を保った0-based順位へ変換します。"
          endpoint={ARRAY_ENDPOINTS.COMPRESS_VALUES}
          values={values}
          renderResult={(data) => <CompressionResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="転倒数"
          description="i < j かつ A[i] > A[j] となる組数を数えます。"
          endpoint={ARRAY_ENDPOINTS.COUNT_INVERSIONS}
          values={values}
          renderResult={(data) => <InversionResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="静的MEX"
          description="配列に存在しない最小の非負整数を求めます。"
          endpoint={ARRAY_ENDPOINTS.STATIC_MEX}
          values={values}
          renderResult={(data) => <MexResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="ランレングス圧縮"
          description="連続する同じ値を値と連続数の組へ変換します。"
          endpoint={ARRAY_ENDPOINTS.RUN_LENGTH_ENCODING}
          values={values}
          renderResult={(data) => <RunLengthResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="右隣のstrict大要素"
          description="右側で最初に現れる、現在値より大きい要素を求めます。"
          endpoint={ARRAY_ENDPOINTS.NEXT_GREATER_TO_RIGHT_STRICT}
          values={values}
          renderResult={(data) => <NextRightResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="右隣のstrict小要素"
          description="右側で最初に現れる、現在値より小さい要素を求めます。"
          endpoint={ARRAY_ENDPOINTS.NEXT_SMALLER_TO_RIGHT_STRICT}
          values={values}
          renderResult={(data) => <NextRightResult data={data} />}
        />
        <ArrayAlgorithmCard
          title="最長distinct部分配列"
          description="全要素が異なる最長連続区間を、左側優先で求めます。"
          endpoint={ARRAY_ENDPOINTS.LONGEST_DISTINCT_SUBARRAY}
          values={values}
          renderResult={(data) => <LongestDistinctResult data={data} />}
        />
      </div>
    </div>
  );
}
