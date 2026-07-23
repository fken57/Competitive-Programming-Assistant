import { postGenerateRandomCase } from './RandomGenApi';

beforeEach(() => {
  global.fetch = jest.fn();
});

test('posts a generation recipe to the Random Gen endpoint', async () => {
  const recipe = {
    generatorVersion: '0.1.0',
    rngAlgorithm: 'splitmix64-v1',
    seed: '123',
    structureType: 'array',
    caseType: 'uniform',
    params: { N: 2, minValue: 0, maxValue: 1 },
    outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
  };
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ recipe, inputText: '2\n0 1\n' }),
  });

  await expect(postGenerateRandomCase(recipe)).resolves.toEqual({
    recipe,
    inputText: '2\n0 1\n',
  });
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:8080/apis/random-gen/generate',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ recipe }),
    }),
  );
});
