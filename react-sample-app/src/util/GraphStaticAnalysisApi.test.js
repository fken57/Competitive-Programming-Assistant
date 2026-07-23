import { postGraphStaticAnalysis } from './GraphStaticAnalysisApi';

afterEach(() => {
  jest.restoreAllMocks();
});

test.each([
  ['undirected', false, '/graphs/unweighted/unordered/analyze'],
  ['directed', false, '/graphs/unweighted/ordered/analyze'],
  ['undirected', true, '/graphs/weighted/unordered/analyze'],
])('selects the static endpoint for %s weighted=%s', async (graphType, hasWeights, endpoint) => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ results: [] }),
  });
  await postGraphStaticAnalysis(graphType, hasWeights, [[]]);
  expect(global.fetch).toHaveBeenCalledWith(
    `http://localhost:8080/apis${endpoint}`,
    expect.any(Object),
  );
});

test('rejects directed weighted mode without making a request', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch');
  await expect(postGraphStaticAnalysis('directed', true, [[]])).rejects.toThrow('静的一覧対象');
  expect(fetchSpy).not.toHaveBeenCalled();
});
