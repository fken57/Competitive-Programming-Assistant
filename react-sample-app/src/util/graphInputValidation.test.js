import { parseGraphAllData } from './graphUtils';

test('unweighted input rejects a weighted edge row instead of discarding its weight', () => {
  expect(() => parseGraphAllData('2 1\n1 2 7', false, false)).toThrow();
});

test('graph input rejects partially numeric tokens instead of truncating them', () => {
  expect(() => parseGraphAllData('2nodes 1\n1 2', false, false)).toThrow();
});
