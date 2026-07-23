import { GenerationHistory, GenerationRecipe } from '../types/RandomGen';

export const RANDOM_GEN_HISTORY_KEY = 'cpa.randomGen.history.v1';
export const HISTORY_LIFETIME_MS = 24 * 60 * 60 * 1000;
let fallbackSequence = 0;

function makeHistoryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  fallbackSequence += 1;
  return `history-${Date.now()}-${fallbackSequence}`;
}

export function loadGenerationHistory(
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now = Date.now(),
): GenerationHistory[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(storage.getItem(RANDOM_GEN_HISTORY_KEY) ?? '[]');
  } catch {
    parsed = [];
  }
  const valid = Array.isArray(parsed)
    ? parsed.filter((item): item is GenerationHistory =>
        typeof item === 'object'
        && item !== null
        && typeof (item as GenerationHistory).expiresAt === 'string'
        && Date.parse((item as GenerationHistory).expiresAt) > now
        && typeof (item as GenerationHistory).recipe === 'object'
        && !('inputText' in (item as Record<string, unknown>))
      )
    : [];
  storage.setItem(RANDOM_GEN_HISTORY_KEY, JSON.stringify(valid));
  return valid;
}

export function saveGenerationRecipe(
  recipe: GenerationRecipe,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now = Date.now(),
): GenerationHistory[] {
  const history = loadGenerationHistory(storage, now);
  const recipeKey = JSON.stringify(recipe);
  const withoutDuplicate = history.filter((item) => JSON.stringify(item.recipe) !== recipeKey);
  const createdAt = new Date(now).toISOString();
  const next: GenerationHistory[] = [{
    id: makeHistoryId(),
    userId: null,
    createdAt,
    expiresAt: new Date(now + HISTORY_LIFETIME_MS).toISOString(),
    recipe,
    killedFlag: false,
  }, ...withoutDuplicate].slice(0, 50);
  storage.setItem(RANDOM_GEN_HISTORY_KEY, JSON.stringify(next));
  return next;
}
