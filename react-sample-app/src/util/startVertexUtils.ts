export function parseStartVertex(input: string, vertexCount: number): number {
  if (!/^\d+$/.test(input)) {
    throw new Error('開始頂点は整数で入力してください。');
  }
  const oneBasedVertex = Number(input);
  if (!Number.isSafeInteger(oneBasedVertex) || oneBasedVertex < 1 || oneBasedVertex > vertexCount) {
    throw new Error(`開始頂点は1以上${vertexCount}以下で入力してください。`);
  }
  return oneBasedVertex - 1;
}
