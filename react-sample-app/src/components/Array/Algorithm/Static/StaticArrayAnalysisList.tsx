import React, { useEffect, useState } from 'react';
import {
  CompactAnalysisList,
  StaticAnalysisItem,
} from '../../../common/CompactAnalysisList';
import { postArrayStaticAnalysis } from '../../../../util/ArraySendApis';
import { formatArrayStaticAnalysis } from '../../../../util/formatArrayStaticAnalysis';

const TITLES: Record<string, string> = {
  build_prefix_sum: '累積和',
  compress_values: '座標圧縮',
  count_inversions: '転倒数',
  static_mex: '静的MEX',
  run_length_encoding: 'ランレングス圧縮',
  next_greater_to_right_strict: '右側で最も近いstrict大要素',
  next_smaller_to_right_strict: '右側で最も近いstrict小要素',
  longest_distinct_subarray: '最長distinct部分配列',
};

export function StaticArrayAnalysisList({ values }: { values: number[] }) {
  const [results, setResults] = useState<StaticAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    postArrayStaticAnalysis(values)
      .then((response) => {
        if (active) setResults(response.results);
      })
      .catch((caughtError) => {
        if (active) setError(caughtError instanceof Error ? caughtError : new Error('一覧の取得に失敗しました。'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [values]);

  return (
    <CompactAnalysisList
      results={results}
      titles={TITLES}
      loading={loading}
      error={error}
      formatResult={formatArrayStaticAnalysis}
    />
  );
}
