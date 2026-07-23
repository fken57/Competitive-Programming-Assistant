import {
  HISTORY_LIFETIME_MS,
  RANDOM_GEN_HISTORY_KEY,
  loadGenerationHistory,
  saveGenerationRecipe,
} from './randomGenHistoryStorage';

const recipe = {
  generatorVersion: '0.1.0',
  rngAlgorithm: 'splitmix64-v1',
  seed: '1',
  structureType: 'array',
  caseType: 'uniform',
  params: { N: 3, minValue: 0, maxValue: 2 },
  outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
};

beforeEach(() => localStorage.clear());

test('stores only a recipe and expires it after 24 hours', () => {
  const now = Date.parse('2026-07-24T00:00:00.000Z');
  const history = saveGenerationRecipe(recipe, localStorage, now);

  expect(history).toHaveLength(1);
  expect(history[0].recipe).toEqual(recipe);
  expect(history[0]).not.toHaveProperty('inputText');
  expect(JSON.parse(localStorage.getItem(RANDOM_GEN_HISTORY_KEY))[0])
    .not.toHaveProperty('inputText');
  expect(loadGenerationHistory(localStorage, now + HISTORY_LIFETIME_MS + 1)).toEqual([]);
});

test('saving the same recipe refreshes it without creating a duplicate', () => {
  saveGenerationRecipe(recipe, localStorage, 1_000);
  const history = saveGenerationRecipe(recipe, localStorage, 2_000);

  expect(history).toHaveLength(1);
  expect(Date.parse(history[0].createdAt)).toBe(2_000);
});
