import {
  AnalysisDisplayField,
  asRecord,
  formatScalar,
  formatSequence,
} from './staticAnalysisFormatting';

const field = (label: string, value: string): AnalysisDisplayField => ({ label, value });

export function formatArrayStaticAnalysis(
  analysisId: string,
  data: unknown,
  previewLimit?: number,
): AnalysisDisplayField[] {
  const result = asRecord(data);

  switch (analysisId) {
    case 'build_prefix_sum':
      return [field('累積和', formatSequence(result.prefix_sum, previewLimit))];
    case 'compress_values':
      return [
        field('圧縮後（0-based）', formatSequence(result.compressed_values, previewLimit)),
        field('順位に対応する値', formatSequence(result.distinct_values, previewLimit)),
      ];
    case 'count_inversions':
      return [field('転倒数', formatScalar(result.inversion_count))];
    case 'static_mex':
      return [field('MEX', formatScalar(result.mex))];
    case 'run_length_encoding':
      return [field(
        '（値, 連続数）',
        formatSequence(result.runs, previewLimit, (run) => {
          const record = asRecord(run);
          return `(${formatScalar(record.value)}, ${formatScalar(record.count)})`;
        }),
      )];
    case 'next_greater_to_right_strict':
    case 'next_smaller_to_right_strict':
      return [
        field(
          '次の位置（1-based）',
          formatSequence(result.next_indices, previewLimit, (index) =>
            typeof index === 'number' && index >= 0 ? String(index + 1) : 'なし'
          ),
        ),
        field('次の値', formatSequence(result.next_values, previewLimit)),
      ];
    case 'longest_distinct_subarray': {
      const left = typeof result.left === 'number' ? result.left + 1 : 'なし';
      const right = typeof result.right_exclusive === 'number'
        ? result.right_exclusive
        : 'なし';
      return [
        field('長さ', formatScalar(result.length)),
        field('区間（1-based、両端を含む）', `${left} ～ ${right}`),
        field('部分配列', formatSequence(result.values, previewLimit)),
      ];
    }
    default:
      return [field('結果', '表示形式が定義されていません')];
  }
}
