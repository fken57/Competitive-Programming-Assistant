import { ARRAY_QUERY_ENDPOINTS, postArrayQuery } from './ArrayQueryApi';

describe('postArrayQuery', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('posts query parameters with the loaded values', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ sum: 9 }),
    });

    await expect(postArrayQuery(
      ARRAY_QUERY_ENDPOINTS.STATIC_RANGE_SUM_QUERY,
      { values: [2, 3, 4], left: 1, right_exclusive: 3 },
    )).resolves.toEqual({ sum: 9 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/apis/array/static_range_sum_query',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ values: [2, 3, 4], left: 1, right_exclusive: 3 }),
      }),
    );
  });

  test('surfaces query validation errors returned by the backend', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: 'modulus must be greater than 0' }),
    });

    await expect(postArrayQuery(
      ARRAY_QUERY_ENDPOINTS.COUNT_SUBARRAYS_SUM_MOD_EQUAL_R,
      { values: [1], modulus: 0, remainder: 0 },
    )).rejects.toThrow('modulus must be greater than 0');
  });
});
