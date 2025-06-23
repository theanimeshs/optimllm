import { ModelType } from "../types";

export class ModelSpecificOptimizer {
  static optimizeForModel(
    text: string,
    model: ModelType
  ): { text: string; optimizations: string[] } {
    const optimizations: string[] = [];
    let result = text;

    switch (model) {
      case "gpt-4":
        result = this.optimizeForGPT4(result, optimizations);
        break;
      case "gpt-3.5-turbo":
        result = this.optimizeForGPT35(result, optimizations);
        break;
      case "claude-3":
      case "claude-2":
        result = this.optimizeForClaude(result, optimizations);
        break;
      case "gemini":
        result = this.optimizeForGemini(result, optimizations);
        break;
      default:
        result = this.optimizeGeneric(result, optimizations);
    }

    return { text: result, optimizations };
  }

  private static optimizeForGPT4(
    text: string,
    optimizations: string[]
  ): string {
    let result = text;

    // GPT-4 handles complex instructions well, add role context if missing
    if (
      !text.toLowerCase().includes("you are") &&
      !text.toLowerCase().includes("act as")
    ) {
      const role = this.inferRole(text);
      if (role) {
        result = `You are ${role}. ${result}`;
        optimizations.push("Added role context for GPT-4");
      }
    }

    // GPT-4 benefits from structured thinking
    if (
      text.length > 200 &&
      !text.includes("step by step") &&
      !text.includes("think through")
    ) {
      result = `${result} Think through this step by step.`;
      optimizations.push("Added structured thinking prompt for GPT-4");
    }

    return result;
  }

  private static optimizeForGPT35(
    text: string,
    optimizations: string[]
  ): string {
    let result = text;

    // GPT-3.5 prefers simpler, more direct instructions
    result = this.simplifyLanguage(result);
    optimizations.push("Simplified language for GPT-3.5");

    // Break down complex requests
    if (text.length > 150) {
      result = this.addStructure(result);
      optimizations.push("Added structure for clarity");
    }

    return result;
  }

  private static optimizeForClaude(
    text: string,
    optimizations: string[]
  ): string {
    let result = text;

    // Claude prefers direct, well-structured prompts
    if (!text.startsWith("Task:") && !text.startsWith("Instructions:")) {
      result = `Task: ${result}`;
      optimizations.push("Added task structure for Claude");
    }

    // Claude handles context well but prefers explicit instructions
    result = this.makeInstructionsExplicit(result);
    optimizations.push("Made instructions more explicit for Claude");

    return result;
  }

  private static optimizeForGemini(
    text: string,
    optimizations: string[]
  ): string {
    let result = text;

    // Gemini benefits from clear formatting and examples
    if (text.length > 100 && !text.includes("Example:")) {
      result = this.suggestExampleStructure(result);
      optimizations.push("Suggested example structure for Gemini");
    }

    return result;
  }

  private static optimizeGeneric(
    text: string,
    optimizations: string[]
  ): string {
    let result = text;

    // Generic optimizations that work across models
    result = this.addClarityMarkers(result);
    optimizations.push("Added clarity markers");

    return result;
  }

  private static inferRole(text: string): string | null {
    const roleKeywords = {
      "expert developer": [
        "code",
        "function",
        "programming",
        "debug",
        "software",
      ],
      "helpful assistant": ["help", "assist", "support", "guide"],
      "technical writer": ["documentation", "explain", "describe", "tutorial"],
      "data analyst": ["analyze", "data", "statistics", "insights"],
      "creative writer": ["story", "creative", "narrative", "write"],
    };

    const lowerText = text.toLowerCase();

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return role;
      }
    }

    return null;
  }

  private static simplifyLanguage(text: string): string {
    const complexToSimple = new Map([
      ["utilize", "use"],
      ["implement", "build"],
      ["demonstrate", "show"],
      ["facilitate", "help"],
      ["comprehensive", "complete"],
      ["methodology", "method"],
      ["subsequently", "then"],
      ["accordingly", "so"],
    ]);

    let result = text;
    for (const [complex, simple] of complexToSimple) {
      const regex = new RegExp(`\\b${complex}\\b`, "gi");
      result = result.replace(regex, simple);
    }

    return result;
  }

  private static addStructure(text: string): string {
    // Add bullet points if the text contains multiple requests
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    if (sentences.length > 2) {
      return sentences
        .map((sentence, index) => `${index + 1}. ${sentence.trim()}`)
        .join("\n");
    }
    return text;
  }

  private static makeInstructionsExplicit(text: string): string {
    // Add explicit output format if not specified
    if (
      !text.toLowerCase().includes("format") &&
      !text.toLowerCase().includes("output")
    ) {
      return `${text} Provide a clear, structured response.`;
    }
    return text;
  }

  private static suggestExampleStructure(text: string): string {
    return `${text}\n\nNote: Include examples where helpful.`;
  }

  private static addClarityMarkers(text: string): string {
    // Add emphasis to important parts
    return text.replace(/\b(important|critical|must|required)\b/gi, "**$1**");
  }
}
