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
  userId?: string | null;
  createdAt: string;
  expiresAt: string;
  recipe: GenerationRecipe;
  killedFlag: boolean;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  total: number;
};

export type GenerationHistoryPage = {
  history: GenerationHistory[];
  pagination: PaginationMetadata;
};

export type FailureType = 'WA' | 'RE' | 'TLE' | 'MLE' | 'CE' | 'UNKNOWN';

export type KilledCase = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  recipe: GenerationRecipe;
  failureType: FailureType;
  reasonTags: string[];
  notes: string;
  isFavorite: boolean;
};

export type KilledCasePage = {
  killedCases: KilledCase[];
  pagination: PaginationMetadata;
};

export type GeneratorPreset = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  recipe: GenerationRecipe;
};
