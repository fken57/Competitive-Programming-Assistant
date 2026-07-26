import {
  deleteKilledCase,
  deleteServerHistory,
  listKilledCases,
  listServerHistory,
  postGenerateRandomCase,
  saveKilledCase,
  saveServerHistory,
} from './RandomGenApi';

beforeEach(() => {
  global.fetch = jest.fn();
});

test('authenticated saved-case requests include credentials and recipes only', async () => {
  const recipe = {
    generatorVersion: '0.1.0',
    rngAlgorithm: 'splitmix64-v1',
    seed: '123',
    structureType: 'array',
    caseType: 'all_same',
    params: { N: 2, minValue: 1, maxValue: 1 },
    outputFormat: { indexBase: 1, hasT: false, lineBreakStyle: 'lf' },
  };
  fetch.mockResolvedValue({ ok: true, json: async () => ({ id: '1', recipe }) });

  await saveServerHistory(recipe);
  await saveKilledCase({
    title: 'case',
    recipe,
    failureType: 'WA',
    reasonTags: ['boundary'],
    notes: 'memo',
  });

  expect(fetch).toHaveBeenCalledTimes(2);
  fetch.mock.calls.forEach(([, options]) => {
    expect(options.credentials).toBe('include');
    expect(options.body).not.toContain('inputText');
  });
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

test('requests paginated saved cases and sends authenticated deletes', async () => {
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      history: [],
      killedCases: [],
      pagination: { page: 2, pageSize: 10, total: 11 },
    }),
  });

  await listServerHistory(2);
  await listKilledCases(2, 'off by one');
  await deleteServerHistory('history/id');
  await deleteKilledCase('killed/id');

  expect(fetch).toHaveBeenNthCalledWith(
    1,
    'http://localhost:8080/apis/random-gen/history?page=2',
    expect.objectContaining({ credentials: 'include' }),
  );
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    'http://localhost:8080/apis/random-gen/killed-cases?page=2&tag=off+by+one',
    expect.objectContaining({ credentials: 'include' }),
  );
  expect(fetch).toHaveBeenNthCalledWith(
    3,
    'http://localhost:8080/apis/random-gen/history/history%2Fid',
    expect.objectContaining({ method: 'DELETE', credentials: 'include' }),
  );
  expect(fetch).toHaveBeenNthCalledWith(
    4,
    'http://localhost:8080/apis/random-gen/killed-cases/killed%2Fid',
    expect.objectContaining({ method: 'DELETE', credentials: 'include' }),
  );
});
