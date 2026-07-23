import { getApiErrorMessage } from './apiResponseUtils';
import {
  FailureType,
  GeneratedCase,
  GenerationHistory,
  GenerationRecipe,
  GeneratorPreset,
  KilledCase,
} from '../types/RandomGen';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/apis';

export async function postGenerateRandomCase(recipe: GenerationRecipe): Promise<GeneratedCase> {
  const response = await fetch(`${API_BASE_URL}/random-gen/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe }),
  });
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }
  return response.json();
}

async function savedCaseRequest(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE_URL}/random-gen${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
}

async function requireJSON<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await getApiErrorMessage(response));
  return response.json();
}

export async function saveServerHistory(recipe: GenerationRecipe): Promise<GenerationHistory> {
  return requireJSON(await savedCaseRequest('/history', {
    method: 'POST',
    body: JSON.stringify({ recipe }),
  }));
}

export async function listServerHistory(): Promise<GenerationHistory[]> {
  const response = await requireJSON<{ history: GenerationHistory[] }>(
    await savedCaseRequest('/history'),
  );
  return response.history;
}

export async function saveKilledCase(input: {
  title: string;
  recipe: GenerationRecipe;
  failureType: FailureType;
  reasonTags: string[];
  notes: string;
}): Promise<KilledCase> {
  return requireJSON(await savedCaseRequest('/killed-cases', {
    method: 'POST',
    body: JSON.stringify(input),
  }));
}

export async function listKilledCases(tag = ''): Promise<KilledCase[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  const response = await requireJSON<{ killedCases: KilledCase[] }>(
    await savedCaseRequest(`/killed-cases${query}`),
  );
  return response.killedCases;
}

export async function saveGeneratorPreset(
  name: string,
  recipe: GenerationRecipe,
): Promise<GeneratorPreset> {
  return requireJSON(await savedCaseRequest('/presets', {
    method: 'POST',
    body: JSON.stringify({ name, recipe }),
  }));
}

export async function listGeneratorPresets(): Promise<GeneratorPreset[]> {
  const response = await requireJSON<{ presets: GeneratorPreset[] }>(
    await savedCaseRequest('/presets'),
  );
  return response.presets;
}
