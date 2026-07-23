import {
  createRecipeShareURL,
  decodeRecipeFromURL,
  encodeRecipeForURL,
} from './randomGenRecipeUrl';

test('round-trips a recipe with Unicode values without input text', () => {
  const recipe = {
    generatorVersion: '0.1.0',
    rngAlgorithm: 'splitmix64-v1',
    seed: '123',
    structureType: 'array',
    caseType: 'uniform',
    params: { N: 2, label: '境界値' },
    outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
  };
  const encoded = encodeRecipeForURL(recipe);

  expect(decodeRecipeFromURL(encoded)).toEqual(recipe);
  expect(encoded).not.toContain('inputText');
  const url = createRecipeShareURL(recipe, 'https://example.com/graph?old=1');
  expect(new URL(url).pathname).toBe('/random-gen');
  expect(new URL(url).searchParams.get('recipe')).toBe(encoded);
});
