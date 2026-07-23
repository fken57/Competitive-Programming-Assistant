import {
  MAX_ARRAY_LENGTH,
  parseArrayInput,
} from './arrayUtils';

describe('parseArrayInput', () => {
  test('parses standard input across arbitrary whitespace', () => {
    expect(parseArrayInput('5\n3 1\n4 1 5')).toEqual([3, 1, 4, 1, 5]);
  });

  test.each([
    ['', '入力が空'],
    ['0', '1以上'],
    ['3\n1 2', '2個'],
    ['2\n1 2 3', '3個'],
    ['2\n1 x', '整数'],
    ['1\n1000000001', '1000000000以下'],
    ['1\n-1000000001', '-1000000000以上'],
  ])('rejects invalid input %#', (input, message) => {
    expect(() => parseArrayInput(input)).toThrow(message);
  });

  test('accepts the maximum array length', () => {
    const input = `${MAX_ARRAY_LENGTH}\n${Array(MAX_ARRAY_LENGTH).fill('0').join(' ')}`;
    expect(parseArrayInput(input)).toHaveLength(MAX_ARRAY_LENGTH);
  });

  test('rejects more than the maximum array length before reading values', () => {
    expect(() => parseArrayInput(`${MAX_ARRAY_LENGTH + 1}`)).toThrow('200000以下');
  });
});
