export const MAX_ARRAY_LENGTH = 200_000;
export const MIN_ARRAY_VALUE = -1_000_000_000;
export const MAX_ARRAY_VALUE = 1_000_000_000;

const parseInteger = (token: string, fieldName: string): number => {
  if (!/^-?\d+$/.test(token)) {
    throw new Error(`${fieldName}は整数で入力してください。`);
  }
  const value = Number(token);
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${fieldName}は安全な整数の範囲で入力してください。`);
  }
  return value;
};

export function parseArrayInput(input: string): number[] {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    throw new Error('入力が空です。1行目に要素数N、続けて配列を入力してください。');
  }

  const length = parseInteger(tokens[0], '要素数N');
  if (length < 1 || length > MAX_ARRAY_LENGTH) {
    throw new Error(`要素数Nは1以上${MAX_ARRAY_LENGTH}以下で入力してください。`);
  }
  if (tokens.length - 1 !== length) {
    throw new Error(`要素数Nは${length}ですが、配列には${tokens.length - 1}個の値があります。`);
  }

  return tokens.slice(1).map((token, index) => {
    const value = parseInteger(token, `配列の${index + 1}番目`);
    if (value < MIN_ARRAY_VALUE || value > MAX_ARRAY_VALUE) {
      throw new Error(`配列の${index + 1}番目は${MIN_ARRAY_VALUE}以上${MAX_ARRAY_VALUE}以下で入力してください。`);
    }
    return value;
  });
}
