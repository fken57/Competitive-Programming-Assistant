import { GenerationRecipe } from '../types/RandomGen';

export function encodeRecipeForURL(recipe: GenerationRecipe): string {
  const binary = encodeURIComponent(JSON.stringify(recipe)).replace(
    /%([0-9A-F]{2})/g,
    (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)),
  );
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeRecipeFromURL(value: string): GenerationRecipe {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const encoded = Array.from(binary)
    .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('');
  return JSON.parse(decodeURIComponent(encoded));
}

export function createRecipeShareURL(recipe: GenerationRecipe, currentURL: string): string {
  const url = new URL(currentURL);
  url.pathname = '/random-gen';
  url.search = '';
  url.hash = '';
  url.searchParams.set('recipe', encodeRecipeForURL(recipe));
  return url.toString();
}
