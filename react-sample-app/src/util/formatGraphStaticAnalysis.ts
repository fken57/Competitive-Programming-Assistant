import {
  AnalysisDisplayField,
  asRecord,
  formatGroups,
  formatOneBasedVertex,
  formatScalar,
  formatSequence,
} from './staticAnalysisFormatting';

const field = (label: string, value: string): AnalysisDisplayField => ({ label, value });

const componentFields = (
  label: string,
  groups: unknown,
  previewLimit?: number,
): AnalysisDisplayField[] =>
  formatGroups(groups, previewLimit, formatOneBasedVertex).map((group, index) =>
    field(group.startsWith('…残り') || group === 'なし' ? label : `${label} ${index + 1}`, group)
  );

const formatEdges = (
  edges: unknown,
  previewLimit?: number,
  weighted = false,
): string =>
  formatSequence(edges, previewLimit, (edge) => {
    const record = asRecord(edge);
    const endpoints = `${formatOneBasedVertex(record.from)} - ${formatOneBasedVertex(record.to)}`;
    return weighted ? `${endpoints}（重み: ${formatScalar(record.weight)}）` : endpoints;
  });

export function formatGraphStaticAnalysis(
  analysisId: string,
  data: unknown,
  previewLimit?: number,
): AnalysisDisplayField[] {
  const result = asRecord(data);

  switch (analysisId) {
    case 'connected_components':
      return componentFields('連結成分', result.components, previewLimit);
    case 'union_find':
      return [
        field('親', formatSequence(result.parents, previewLimit, formatOneBasedVertex)),
        ...componentFields('連結成分', result.components, previewLimit),
      ];
    case 'low_link':
      return [
        field('関節点', formatSequence(
          result.articulation_points,
          previewLimit,
          formatOneBasedVertex,
        )),
        field('橋', formatEdges(result.bridges, previewLimit)),
      ];
    case 'is_binary_tree': {
      const isBipartite = result.is_binary_tree === true;
      return [
        field('判定', isBipartite ? '二部グラフです' : '二部グラフではありません'),
        ...(isBipartite
          ? [
              field('グループ1', formatSequence(result.group_one, previewLimit, formatOneBasedVertex)),
              field('グループ2', formatSequence(result.group_two, previewLimit, formatOneBasedVertex)),
            ]
          : [field('奇数閉路', formatSequence(result.odd_cycle, previewLimit, formatOneBasedVertex))]),
      ];
    }
    case 'is_tree': {
      const isTree = result.is_tree === true;
      return [
        field('判定', isTree ? '木です' : '木ではありません'),
        ...(!isTree && Array.isArray(result.cycle) && result.cycle.length > 0
          ? [field('閉路', formatSequence(result.cycle, previewLimit, formatOneBasedVertex))]
          : []),
        ...(!isTree && Array.isArray(result.components) && result.components.length > 1
          ? componentFields('連結成分', result.components, previewLimit)
          : []),
      ];
    }
    case 'tree_distance':
      return [
        field('直径', formatScalar(result.tree_dir)),
        field('端点', `${formatOneBasedVertex(result.vertex1)}, ${formatOneBasedVertex(result.vertex2)}`),
      ];
    case 'directed_cycle': {
      const hasCycle = result.has_cycle === true;
      return [
        field('判定', hasCycle ? '有向閉路があります' : '有向閉路はありません'),
        ...(hasCycle
          ? [field('閉路', formatSequence(result.cycle, previewLimit, formatOneBasedVertex))]
          : []),
      ];
    }
    case 'topological_sort': {
      const sortable = result.sortable === true;
      return [
        field('判定', sortable ? 'トポロジカルソート可能です' : 'トポロジカルソートできません'),
        ...(sortable
          ? [field('順序', formatSequence(result.vertices, previewLimit, formatOneBasedVertex))]
          : [field('閉路', formatSequence(result.cycle, previewLimit, formatOneBasedVertex))]),
      ];
    }
    case 'scc':
      return componentFields('SCC', result.sccs, previewLimit);
    case 'prim':
      return [
        field('結果', result.is_spanning === true ? '最小全域木' : '最小全域森'),
        field('合計重み', formatScalar(result.total_weight)),
        field('辺', formatEdges(result.edges, previewLimit, true)),
      ];
    case 'tree_diameter':
      return [
        field('直径', formatScalar(result.diameter)),
        field('端点', `${formatOneBasedVertex(result.vertex1)}, ${formatOneBasedVertex(result.vertex2)}`),
      ];
    default:
      return [field('結果', '表示形式が定義されていません')];
  }
}
