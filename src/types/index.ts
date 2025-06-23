export type ModelType =
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-3"
  | "claude-2"
  | "gemini"
  | "generic";

export interface OptimizationConfig {
  /** Remove unnecessary stop words and filler phrases */
  removeStopWords?: boolean;

  /** Replace long words with shorter abbreviations */
  useAbbreviations?: boolean;

  /** Optimize prompt structure for specific LLM model */
  optimizeForModel?: ModelType;

  /** Maximum token limit for the optimized prompt */
  maxTokens?: number;

  /** Preserve important context even during aggressive optimization */
  preserveContext?: boolean;

  /** Add few-shot examples to improve prompt effectiveness */
  examples?: string[];

  /** Custom stop words to remove (in addition to defaults) */
  customStopWords?: string[];

  /** Custom abbreviations map */
  customAbbreviations?: Map<string, string>;

  /** Aggressiveness level: 'conservative' | 'moderate' | 'aggressive' */
  aggressiveness?: "conservative" | "moderate" | "aggressive";
}

export interface OptimizationResult {
  /** Original input prompt */
  originalPrompt: string;

  /** Optimized version of the prompt */
  optimizedPrompt: string;

  /** Number of tokens saved through optimization */
  tokensSaved: number;

  /** Estimated token count of optimized prompt */
  estimatedTokens: number;

  /** List of optimizations that were applied */
  optimizations: string[];

  /** Percentage reduction in tokens */
  reductionPercentage: number;

  /** Confidence score of the optimization (0-1) */
  confidenceScore: number;

  /** Warnings about potentially problematic optimizations */
  warnings: string[];
}

export interface BatchOptimizationResult {
  /** Results for each individual prompt */
  results: OptimizationResult[];

  /** Total tokens saved across all prompts */
  totalTokensSaved: number;

  /** Average reduction percentage */
  averageReduction: number;

  /** Processing time in milliseconds */
  processingTime: number;
}

export interface TokenEstimation {
  /** Estimated token count */
  tokens: number;

  /** Method used for estimation */
  method: "character-based" | "word-based" | "tiktoken";

  /** Confidence in the estimation (0-1) */
  confidence: number;
}
