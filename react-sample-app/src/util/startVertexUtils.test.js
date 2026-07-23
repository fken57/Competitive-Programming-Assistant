import { parseStartVertex } from './startVertexUtils';

test('converts a one-based start vertex to zero-based', () => {
  expect(parseStartVertex('3', 5)).toBe(2);
});

test.each(['', '0', '6', '1.5', '-1', 'x'])('rejects invalid start vertex %p', (value) => {
  expect(() => parseStartVertex(value, 5)).toThrow('開始頂点');
});
