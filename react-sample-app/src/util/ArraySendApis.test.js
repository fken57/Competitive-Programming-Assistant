import { ARRAY_ENDPOINTS, postArray, postArrayStaticAnalysis } from './ArraySendApis';

describe('postArray', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('posts values to the selected array endpoint', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ prefix_sum: [0, 2, 5] }),
    });

    await expect(postArray(ARRAY_ENDPOINTS.BUILD_PREFIX_SUM, { values: [2, 3] }))
      .resolves.toEqual({ prefix_sum: [0, 2, 5] });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/apis/array/build_prefix_sum',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ values: [2, 3] }),
      }),
    );
  });

  test('surfaces the backend error message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'values must contain at least one element' }),
    });

    await expect(postArray(ARRAY_ENDPOINTS.STATIC_MEX, { values: [] }))
      .rejects.toThrow('values must contain at least one element');
  });

  test('requests all static array analyses through the batch endpoint', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ results: [] }),
    });

    await postArrayStaticAnalysis([1, 2, 3]);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/apis/array/static/analyze',
      expect.objectContaining({
        body: JSON.stringify({ values: [1, 2, 3] }),
      }),
    );
  });
});
