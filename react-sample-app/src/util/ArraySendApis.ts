import { getApiErrorMessage } from './apiResponseUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export const ARRAY_ENDPOINTS = {
  BUILD_PREFIX_SUM: '/array/build_prefix_sum',
  COMPRESS_VALUES: '/array/compress_values',
  COUNT_INVERSIONS: '/array/count_inversions',
  STATIC_MEX: '/array/static_mex',
  RUN_LENGTH_ENCODING: '/array/run_length_encoding',
  NEXT_GREATER_TO_RIGHT_STRICT: '/array/next_greater_to_right_strict',
  NEXT_SMALLER_TO_RIGHT_STRICT: '/array/next_smaller_to_right_strict',
  LONGEST_DISTINCT_SUBARRAY: '/array/longest_distinct_subarray',
} as const;

export type ArrayEndpoint = typeof ARRAY_ENDPOINTS[keyof typeof ARRAY_ENDPOINTS];

export type ArrayRequest = {
  values: number[];
};

export type Run = {
  value: number;
  count: number;
};

export type ArrayApiResponse = {
  prefix_sum?: number[];
  compressed_values?: number[];
  distinct_values?: number[];
  inversion_count?: number;
  mex?: number;
  runs?: Run[];
  next_indices?: number[];
  next_values?: Array<number | null>;
  length?: number;
  left?: number;
  right_exclusive?: number;
  values?: number[];
};

export async function postArray<TResponse extends ArrayApiResponse = ArrayApiResponse>(
  endpoint: ArrayEndpoint,
  payload: ArrayRequest,
): Promise<TResponse> {
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
