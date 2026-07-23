import { formatGraphStaticAnalysis } from './formatGraphStaticAnalysis';

test('formats union-find parents and components as 1-based vertices', () => {
  expect(formatGraphStaticAnalysis('union_find', {
    parents: [0, 0],
    components: [[0, 1]],
  })).toEqual([
    { label: '親', value: '1, 1' },
    { label: '連結成分 1', value: '1, 2' },
  ]);
});

test('formats low-link and weighted edges for people', () => {
  expect(formatGraphStaticAnalysis('low_link', {
    articulation_points: [1],
    bridges: [{ from: 0, to: 1 }],
  })).toEqual([
    { label: '関節点', value: '2' },
    { label: '橋', value: '1 - 2' },
  ]);

  expect(formatGraphStaticAnalysis('prim', {
    is_spanning: true,
    total_weight: 7,
    edges: [{ from: 0, to: 1, weight: 7 }],
  })).toEqual([
    { label: '結果', value: '最小全域木' },
    { label: '合計重み', value: '7' },
    { label: '辺', value: '1 - 2（重み: 7）' },
  ]);
});

test('shows the odd cycle when the graph is not bipartite', () => {
  expect(formatGraphStaticAnalysis('is_binary_tree', {
    is_binary_tree: false,
    odd_cycle: [0, 1, 2, 0],
  })).toEqual([
    { label: '判定', value: '二部グラフではありません' },
    { label: '奇数閉路', value: '1, 2, 3, 1' },
  ]);
});

test('provides a formatter for every static graph analysis', () => {
  const cases = [
    ['connected_components', { components: [[0]] }],
    ['is_tree', { is_tree: true }],
    ['tree_distance', { tree_dir: 0, vertex1: 0, vertex2: 0 }],
    ['directed_cycle', { has_cycle: false, cycle: [] }],
    ['topological_sort', { sortable: true, vertices: [0], cycle: [] }],
    ['scc', { sccs: [[0]] }],
    ['tree_diameter', { diameter: 0, vertex1: 0, vertex2: 0 }],
  ];

  cases.forEach(([id, data]) => {
    expect(formatGraphStaticAnalysis(id, data)[0].value)
      .not.toBe('表示形式が定義されていません');
  });
});
