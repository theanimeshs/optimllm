import { ModelSpecificOptimizer } from "../src/utils/modelSpecific";

describe("ModelSpecificOptimizer", () => {
  it("should optimize for GPT-4", () => {
    const longPrompt =
      "Explain in detail how to debug JavaScript code and write cleaner functions for maintainable software. Include all best practices and methodologies. Also, describe code smells, anti-patterns, and common developer mistakes. Show how to handle async code and error handling, and provide advanced debugging techniques using browser tools and logs.";

    const { text, optimizations } = ModelSpecificOptimizer.optimizeForModel(
      longPrompt,
      "gpt-4"
    );

    expect(text).toMatch(/You are .*developer/i); // role inferred
    expect(text).toMatch(/step by step|Think through/i);
    expect(optimizations).toContainEqual(
      expect.stringMatching(/role context/i)
    );
    expect(optimizations).toContainEqual(
      expect.stringMatching(/structured thinking/i)
    );
  });

  it("should optimize for GPT-3.5", () => {
    const input =
      "Please facilitate the process and subsequently demonstrate how to implement a comprehensive plan for using OpenAI APIs.";

    const { text, optimizations } = ModelSpecificOptimizer.optimizeForModel(
      input,
      "gpt-3.5-turbo"
    );

    expect(text).not.toMatch(/facilitate|subsequently|comprehensive/);
    expect(optimizations).toContainEqual(
      expect.stringMatching(/Simplified language/i)
    );
  });

  it("should optimize for Claude", () => {
    const input =
      "Describe the process of performing sentiment analysis on social media data using Python. Include preprocessing, libraries, and evaluation.";

    const { text, optimizations } = ModelSpecificOptimizer.optimizeForModel(
      input,
      "claude-2"
    );

    expect(text).toMatch(/^Task:/);
    expect(text).toMatch(/structured response/);
    expect(optimizations).toContainEqual(
      expect.stringMatching(/task structure/i)
    );
    expect(optimizations).toContainEqual(expect.stringMatching(/explicit/i));
  });

  it("should optimize for Gemini", () => {
    const input =
      "Explain how to train a machine learning model on custom data. Include detailed steps, tools, and considerations for accuracy.";

    const { text, optimizations } = ModelSpecificOptimizer.optimizeForModel(
      input,
      "gemini"
    );

    expect(text).toMatch(/Include examples/i);
    expect(optimizations).toContainEqual(
      expect.stringMatching(/example structure/i)
    );
  });

  it("should use generic optimization for unknown model", () => {
    const input = "It is critical to test all required inputs in your form.";

    const { text, optimizations } = ModelSpecificOptimizer.optimizeForModel(
      input,
      "generic"
    );

    expect(text).toMatch(/\*\*critical\*\*/);
    expect(optimizations).toContainEqual(
      expect.stringMatching(/clarity markers/i)
    );
  });
});
