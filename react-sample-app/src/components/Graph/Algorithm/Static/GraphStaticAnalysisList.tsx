import React, { useEffect, useState } from 'react';
import {
  CompactAnalysisList,
  StaticAnalysisItem,
} from '../../../common/CompactAnalysisList';
import { postGraphStaticAnalysis } from '../../../../util/GraphStaticAnalysisApi';

const TITLES: Record<string, string> = {
  connected_components: '連結成分',
  union_find: 'Union-Find',
  low_link: 'Low-Link',
  is_binary_tree: '二部グラフ判定',
  is_tree: '木判定',
  tree_distance: '木の直径',
  directed_cycle: '有向閉路検出',
  topological_sort: 'トポロジカルソート',
  scc: 'SCC',
  prim: 'Prim法',
  tree_diameter: '重み付き木の直径',
};

type GraphStaticAnalysisListProps = {
  graphType: 'undirected' | 'directed';
  hasWeights: boolean;
  adjacentList: unknown[];
};

export function GraphStaticAnalysisList({
  graphType,
  hasWeights,
  adjacentList,
}: GraphStaticAnalysisListProps) {
  const [results, setResults] = useState<StaticAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    postGraphStaticAnalysis(graphType, hasWeights, adjacentList)
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
  }, [graphType, hasWeights, adjacentList]);

  return <CompactAnalysisList results={results} titles={TITLES} loading={loading} error={error} />;
}
