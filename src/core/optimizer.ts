import {
  OptimizationConfig,
  OptimizationResult,
  BatchOptimizationResult,
  ModelType,
} from "../types";
import { TokenCounter } from "../utils/tokenCounter";
import { TextProcessor } from "../utils/textProcessor";
import { ModelSpecificOptimizer } from "../utils/modelSpecific";

export class PromptOptimizer {
  private config: Required<OptimizationConfig>;

  constructor(config: OptimizationConfig = {}) {
    this.config = {
      removeStopWords: config.removeStopWords ?? true,
      useAbbreviations: config.useAbbreviations ?? false,
      optimizeForModel: config.optimizeForModel ?? "generic",
      maxTokens: config.maxTokens ?? 0,
      preserveContext: config.preserveContext ?? true,
      examples: config.examples ?? [],
      customStopWords: config.customStopWords ?? [],
      customAbbreviations: config.customAbbreviations ?? new Map(),
      aggressiveness: config.aggressiveness ?? "moderate",
    };
  }

  optimize(prompt: string): OptimizationResult {
    const startTime = Date.now();
    const originalTokens = TokenCounter.estimate(
      prompt,
      this.config.optimizeForModel
    );
    const optimizations: string[] = [];
    const warnings: string[] = [];

    let optimized = prompt.trim();

    // Preserve important context before optimization
    const importantContext = this.config.preserveContext
      ? TextProcessor.preserveImportantContext(optimized)
      : [];

    // Apply optimizations based on aggressiveness level
    optimized = this.applyOptimizations(optimized, optimizations, warnings);

    // Model-specific optimizations
    const modelResult = ModelSpecificOptimizer.optimizeForModel(
      optimized,
      this.config.optimizeForModel
    );
    optimized = modelResult.text;
    optimizations.push(...modelResult.optimizations);

    // Add examples if provided
    if (this.config.examples.length > 0) {
      optimized = this.addExamples(optimized, this.config.examples);
      optimizations.push("Added few-shot examples");
    }

    // Ensure important context is preserved
    if (importantContext.length > 0 && this.config.preserveContext) {
      optimized = this.reintegrateCriticalContext(optimized, importantContext);
      optimizations.push("Preserved critical context");
    }

    // Apply token limit if specified
    if (this.config.maxTokens) {
      const beforeTruncation = optimized;
      optimized = this.truncateToTokenLimit(optimized, this.config.maxTokens);
      if (optimized !== beforeTruncation) {
        optimizations.push(`Truncated to ${this.config.maxTokens} tokens`);
        warnings.push("Content was truncated to meet token limit");
      }
    }

    // Final cleanup
    optimized = TextProcessor.cleanWhitespace(optimized);

    const finalTokens = TokenCounter.estimate(
      optimized,
      this.config.optimizeForModel
    );
    const tokensSaved = originalTokens.tokens - finalTokens.tokens;
    const reductionPercentage = (tokensSaved / originalTokens.tokens) * 100;

    const processingTime = Date.now() - startTime;
    const confidenceScore = this.calculateConfidenceScore(
      optimized,
      originalTokens.tokens,
      finalTokens.tokens,
      processingTime
    );

    return {
      originalPrompt: prompt,
      optimizedPrompt: optimized,
      tokensSaved: Math.max(0, tokensSaved),
      estimatedTokens: finalTokens.tokens,
      optimizations,
      reductionPercentage: Math.max(0, reductionPercentage),
      confidenceScore,
      warnings,
    };
  }

  optimizeBatch(prompts: string[]): BatchOptimizationResult {
    const startTime = Date.now();
    const results = prompts.map((prompt) => this.optimize(prompt));
    const processingTime = Date.now() - startTime;

    const totalTokensSaved = results.reduce(
      (sum, result) => sum + result.tokensSaved,
      0
    );
    const averageReduction =
      results.reduce((sum, result) => sum + result.reductionPercentage, 0) /
      results.length;

    return {
      results,
      totalTokensSaved,
      averageReduction,
      processingTime,
    };
  }

  private applyOptimizations(
    text: string,
    optimizations: string[],
    warnings: string[]
  ): string {
    let result = text;

    // Remove redundancy first
    const beforeRedundancy = result;
    result = TextProcessor.removeRedundancy(result);
    if (result !== beforeRedundancy) {
      optimizations.push("Removed redundant content");
    }

    // Remove stop words based on aggressiveness
    if (this.config.removeStopWords) {
      const beforeStopWords = result;
      result = TextProcessor.removeStopWords(
        result,
        this.config.customStopWords
      );
      if (result !== beforeStopWords) {
        optimizations.push("Removed stop words");

        // Check if we removed too much
        if (result.length < beforeStopWords.length * 0.5) {
          warnings.push(
            "Aggressive stop word removal may have affected meaning"
          );
        }
      }
    }

    // Apply abbreviations
    if (this.config.useAbbreviations) {
      const beforeAbbrev = result;
      result = TextProcessor.applyAbbreviations(
        result,
        this.config.customAbbreviations
      );
      if (result !== beforeAbbrev) {
        optimizations.push("Applied abbreviations");
      }
    }

    return result;
  }

  private addExamples(prompt: string, examples: string[]): string {
    const exampleText = examples
      .map((example, index) => `Example ${index + 1}: ${example}`)
      .join("\n");

    return `${prompt}\n\nExamples:\n${exampleText}`;
  }

  private reintegrateCriticalContext(
    optimized: string,
    context: string[]
  ): string {
    if (context.length === 0) return optimized;

    const contextNote = context.join(" ");
    return `${optimized}\n\nImportant: ${contextNote}`;
  }

  private truncateToTokenLimit(text: string, maxTokens: number): string {
    const currentTokens = TokenCounter.estimate(
      text,
      this.config.optimizeForModel
    );

    if (currentTokens.tokens <= maxTokens) {
      return text;
    }

    // Estimate how much to truncate
    const ratio = maxTokens / currentTokens.tokens;
    const targetLength = Math.floor(text.length * ratio * 0.9); // 10% buffer

    const truncated = text.substring(0, targetLength);

    // Try to end at a sentence boundary
    const lastSentence = truncated.lastIndexOf(".");
    if (lastSentence > targetLength * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }

    return truncated + "...";
  }

  private calculateConfidenceScore(
    optimized: string,
    originalTokens: number,
    finalTokens: number,
    processingTime: number
  ): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on reduction achieved
    const reduction = (originalTokens - finalTokens) / originalTokens;
    if (reduction > 0.3) confidence += 0.1; // Good reduction
    if (reduction > 0.5) confidence += 0.1; // Excellent reduction

    // Adjust based on final prompt quality
    if (optimized.length < 10) confidence -= 0.3; // Too short
    if (optimized.includes("...")) confidence -= 0.1; // Was truncated

    // Adjust based on processing complexity
    if (processingTime > 1000) confidence -= 0.1; // Took too long

    return Math.max(0, Math.min(1, confidence));
  }

  // Utility methods
  static estimateTokens(text: string, model: ModelType = "generic") {
    return TokenCounter.estimate(text, model);
  }

  static removeStopWords(text: string, customStopWords?: string[]) {
    return TextProcessor.removeStopWords(text, customStopWords);
  }

  static applyAbbreviations(
    text: string,
    customAbbreviations?: Map<string, string>
  ) {
    return TextProcessor.applyAbbreviations(text, customAbbreviations);
  }
}
