import { PromptOptimizer } from "../src";
import type { OptimizationConfig } from "../src/types";

describe("PromptOptimizer", () => {
  it("should return optimized result with token savings", () => {
    const optimizer = new PromptOptimizer();
    const input =
      "Please, could you kindly write a detailed explanation of how to install Node.js?";

    const result = optimizer.optimize(input);

    expect(result).toHaveProperty("originalPrompt", input);
    expect(result).toHaveProperty("optimizedPrompt");
    expect(result.tokensSaved).toBeGreaterThanOrEqual(0);
    expect(result.optimizedPrompt.length).toBeLessThanOrEqual(input.length);
    expect(result.optimizations.length).toBeGreaterThanOrEqual(0);
  });

  it("should apply maxTokens truncation", () => {
    const config: OptimizationConfig = {
      maxTokens: 10,
    };

    const optimizer = new PromptOptimizer(config);

    const input =
      "Please write a long and verbose explanation that includes every step of how to install Node.js on various operating systems.";

    const result = optimizer.optimize(input);

    // This checks actual truncation logic, not rough token estimation
    expect(result.optimizedPrompt.length).toBeLessThan(input.length);
    expect(result.optimizations).toContainEqual(
      expect.stringMatching(/Truncated/)
    );
  });

  it("should include examples when provided", () => {
    const config: OptimizationConfig = {
      examples: ["Use `nvm install node` to install Node.js."],
    };

    const optimizer = new PromptOptimizer(config);

    const input = "How do I install Node.js?";
    const result = optimizer.optimize(input);

    expect(result.optimizedPrompt).toMatch(/Examples:/);
    expect(result.optimizations).toContain("Added few-shot examples");
  });

  it("should preserve critical context when enabled", () => {
    const config: OptimizationConfig = {
      preserveContext: true,
    };

    const optimizer = new PromptOptimizer(config);

    const input =
      "In a situation where security is critical, explain how Node.js should be installed.";
    const result = optimizer.optimize(input);

    expect(result.optimizations).toContain("Preserved critical context");
    expect(result.optimizedPrompt).toMatch(/Important:/);
  });

  it("should optimize a batch of prompts", () => {
    const optimizer = new PromptOptimizer();

    const prompts = [
      "Explain how to install Node.js.",
      "Describe how to uninstall Node.js.",
    ];

    const batch = optimizer.optimizeBatch(prompts);

    expect(batch.results.length).toBe(prompts.length);
    expect(batch.totalTokensSaved).toBeGreaterThanOrEqual(0);
    expect(batch.averageReduction).toBeGreaterThanOrEqual(0);
    expect(batch.processingTime).toBeGreaterThanOrEqual(0);
  });
});
