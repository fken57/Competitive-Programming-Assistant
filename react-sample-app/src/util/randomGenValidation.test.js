import { maximumSimpleGraphEdges, validateGraphSettings } from './randomGenValidation';

test('calculates simple graph edge limits', () => {
  expect(maximumSimpleGraphEdges(5, false, false)).toBe(10);
  expect(maximumSimpleGraphEdges(5, true, false)).toBe(20);
});

test('rejects the reported impossible graph settings before API submission', () => {
  expect(validateGraphSettings({
    n: 5,
    m: 100,
    graphType: 'random_dense',
    directed: false,
    connected: false,
    allowSelfLoop: false,
    allowMultiEdge: false,
  })).toBe('この設定では最大 M は 10 です');
});

test('rejects conflicting graph type settings', () => {
  expect(validateGraphSettings({
    n: 5,
    m: 4,
    graphType: 'dag',
    directed: false,
    connected: true,
    allowSelfLoop: false,
    allowMultiEdge: false,
  })).toBe('dagは有向・自己ループなしにしてください');
});
