import { truncateAnalysisValue } from './CompactAnalysisList';

test('keeps the first 20 array items and reports the remainder', () => {
  const values = Array.from({ length: 25 }, (_, index) => index);
  expect(truncateAnalysisValue(values)).toEqual([
    ...values.slice(0, 20),
    '…残り5件',
  ]);
});

test('truncates arrays nested in response objects', () => {
  const result = truncateAnalysisValue({ values: Array.from({ length: 21 }, (_, index) => index) });
  expect(result.values).toHaveLength(21);
  expect(result.values[20]).toBe('…残り1件');
});
