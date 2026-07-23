export type AnalysisDisplayField = {
  label: string;
  value: string;
};

export type StaticAnalysisFormatter = (
  analysisId: string,
  data: unknown,
  previewLimit?: number,
) => AnalysisDisplayField[];

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return 'なし';
  if (typeof value === 'boolean') return value ? 'はい' : 'いいえ';
  return String(value);
}

export function formatSequence(
  value: unknown,
  previewLimit?: number,
  transform: (item: unknown, index: number) => string = formatScalar,
): string {
  if (!Array.isArray(value) || value.length === 0) return 'なし';

  const visibleValues = previewLimit === undefined
    ? value
    : value.slice(0, previewLimit);
  const formatted = visibleValues.map(transform);

  if (previewLimit !== undefined && value.length > previewLimit) {
    formatted.push(`…残り${value.length - previewLimit}件`);
  }
  return formatted.join(', ');
}

export function formatGroups(
  value: unknown,
  previewLimit?: number,
  itemTransform: (item: unknown, index: number) => string = formatScalar,
): string[] {
  if (!Array.isArray(value) || value.length === 0) return ['なし'];

  const visibleGroups = previewLimit === undefined
    ? value
    : value.slice(0, previewLimit);
  const groups = visibleGroups.map((group) =>
    formatSequence(group, previewLimit, itemTransform)
  );

  if (previewLimit !== undefined && value.length > previewLimit) {
    groups.push(`…残り${value.length - previewLimit}成分`);
  }
  return groups;
}

export function formatOneBasedVertex(value: unknown): string {
  return typeof value === 'number' && Number.isInteger(value)
    ? String(value + 1)
    : formatScalar(value);
}

const REASON_TRANSLATIONS: Record<string, string> = {
  'graph is not a tree': '入力グラフが木ではないため実行できません',
  'the graph is not a tree': '入力グラフが木ではないため実行できません',
  'the graph is not an undirected tree': '入力グラフが無向木ではないため実行できません',
  'tree diameter does not support negative weights': '負の重みを含む木の直径には対応していません',
};

export function formatAnalysisReason(reason?: string): string {
  if (!reason) return '理由はありません';
  return REASON_TRANSLATIONS[reason] ?? reason;
}
