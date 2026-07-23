export type StructureType = 'array' | 'tree' | 'graph';

export type OutputFormat = {
  indexBase: 0 | 1;
  hasT: boolean;
  lineBreakStyle: 'lf';
};

export type GenerationRecipe = {
  generatorVersion: '0.1.0';
  rngAlgorithm: 'splitmix64-v1';
  seed: string;
  structureType: StructureType;
  caseType: string;
  params: Record<string, unknown>;
  outputFormat: OutputFormat;
};

export type GeneratedCase = {
  recipe: GenerationRecipe;
  inputText: string;
};

export type GenerationHistory = {
  id: string;
  userId: null;
  createdAt: string;
  expiresAt: string;
  recipe: GenerationRecipe;
  killedFlag: boolean;
};
