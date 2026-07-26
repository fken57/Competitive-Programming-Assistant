import { getApiErrorMessage } from './apiResponseUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export const ARRAY_QUERY_ENDPOINTS = {
  STATIC_RANGE_SUM_QUERY: '/array/static_range_sum_query',
  COUNT_SUBARRAYS_SUM_EQUAL_K: '/array/count_subarrays_sum_equal_k',
  COUNT_SUBARRAYS_SUM_MOD_EQUAL_R: '/array/count_subarrays_sum_mod_equal_r',
  FIXED_WINDOW_MINIMUM: '/array/fixed_window_minimum',
  FIXED_WINDOW_MAXIMUM: '/array/fixed_window_maximum',
  COUNT_PAIRS_SUM_AT_MOST_K_AFTER_SORT: '/array/count_pairs_sum_at_most_k_after_sort',
  COUNT_PAIRS_ABS_DIFF_AT_MOST_K_AFTER_SORT: '/array/count_pairs_abs_diff_at_most_k_after_sort',
} as const;

export type ArrayQueryEndpoint = typeof ARRAY_QUERY_ENDPOINTS[keyof typeof ARRAY_QUERY_ENDPOINTS];

type ValuesPayload = {
  values: number[];
};

export type ArrayQueryRequest =
  | (ValuesPayload & { left: number; right_exclusive: number })
  | (ValuesPayload & { target: number })
  | (ValuesPayload & { modulus: number; remainder: number })
  | (ValuesPayload & { window_size: number })
  | (ValuesPayload & { max_difference: number });

export type ArrayQueryResponse = {
  sum?: number;
  count?: number;
  minimums?: number[];
  maximums?: number[];
};

export async function postArrayQuery(
  endpoint: ArrayQueryEndpoint,
  payload: ArrayQueryRequest,
): Promise<ArrayQueryResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
  return response.json();
}
