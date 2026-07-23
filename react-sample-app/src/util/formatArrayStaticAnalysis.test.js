import { formatArrayStaticAnalysis } from './formatArrayStaticAnalysis';

test('formats prefix sums as a labeled sequence', () => {
  expect(formatArrayStaticAnalysis('build_prefix_sum', {
    prefix_sum: [0, 1, 3],
  })).toEqual([
    { label: '累積和', value: '0, 1, 3' },
  ]);
});

test('limits array previews while keeping full detail available', () => {
  const values = Array.from({ length: 25 }, (_, index) => index);

  expect(formatArrayStaticAnalysis(
    'build_prefix_sum',
    { prefix_sum: values },
    20,
  )[0].value).toContain('…残り5件');
  expect(formatArrayStaticAnalysis(
    'build_prefix_sum',
    { prefix_sum: values },
  )[0].value).not.toContain('…残り');
});

test('formats next positions as 1-based and missing values as none', () => {
  expect(formatArrayStaticAnalysis('next_greater_to_right_strict', {
    next_indices: [2, -1],
    next_values: [5, null],
  })).toEqual([
    { label: '次の位置（1-based）', value: '3, なし' },
    { label: '次の値', value: '5, なし' },
  ]);
});

test('provides a formatter for every static array analysis', () => {
  const cases = [
    ['compress_values', { compressed_values: [0], distinct_values: [10] }],
    ['count_inversions', { inversion_count: 1 }],
    ['static_mex', { mex: 2 }],
    ['run_length_encoding', { runs: [{ value: 1, count: 2 }] }],
    ['longest_distinct_subarray', {
      length: 1,
      left: 0,
      right_exclusive: 1,
      values: [3],
    }],
  ];

  cases.forEach(([id, data]) => {
    expect(formatArrayStaticAnalysis(id, data)[0].value)
      .not.toBe('表示形式が定義されていません');
  });
});
