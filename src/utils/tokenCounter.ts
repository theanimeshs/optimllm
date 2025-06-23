import { TokenEstimation, ModelType } from "../types";

export class TokenCounter {
  private static readonly CHARS_PER_TOKEN = {
    "gpt-4": 4,
    "gpt-3.5-turbo": 4,
    "claude-3": 3.8,
    "claude-2": 3.8,
    gemini: 4.2,
    generic: 4,
  };

  static estimate(text: string, model: ModelType = "generic"): TokenEstimation {
    const charsPerToken = this.CHARS_PER_TOKEN[model];
    const estimatedTokens = Math.ceil(text.length / charsPerToken);

    // Adjust for common patterns
    const adjustedTokens = this.applyPatternAdjustments(
      text,
      estimatedTokens,
      model
    );

    return {
      tokens: adjustedTokens,
      method: "character-based",
      confidence: 0.85,
    };
  }

  private static applyPatternAdjustments(
    text: string,
    baseTokens: number,
    model: ModelType
  ): number {
    let adjustment = 0;

    // Code blocks typically use more tokens
    const codeMatches = text.match(/```[\s\S]*?```/g) || [];
    adjustment += codeMatches.length * 2;

    // Special characters and punctuation
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    adjustment += Math.floor(specialChars / 10);

    // Very long words are often multiple tokens
    const longWords = text.split(/\s+/).filter((word) => word.length > 12);
    adjustment += longWords.length;

    return Math.max(1, baseTokens + adjustment);
  }

  static estimateBatch(
    texts: string[],
    model: ModelType = "generic"
  ): TokenEstimation[] {
    return texts.map((text) => this.estimate(text, model));
  }
}
