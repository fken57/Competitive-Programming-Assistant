import { getApiErrorMessage } from './apiResponseUtils';
import { GeneratedCase, GenerationRecipe } from '../types/RandomGen';

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
