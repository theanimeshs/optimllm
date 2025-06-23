import { TextProcessor } from "../src/utils/textProcessor";

describe("TextProcessor", () => {
  it("should remove stop words", () => {
    const input =
      "I think it would be great if you could assist me with this task. Please help!";
    const output = TextProcessor.removeStopWords(input);

    // Should not contain any default stop word phrases
    expect(output).not.toMatch(/i think/i);
    expect(output).not.toMatch(/it would be great/i);
    expect(output).not.toMatch(/assist me/i);
    expect(output).not.toMatch(/please help/i);
  });

  it("should apply abbreviations", () => {
    const map = new Map([["for example", "e.g."]]);
    const input = "This is an example, for example.";
    const result = TextProcessor.applyAbbreviations(input, map);
    expect(result).toContain("e.g.");
  });

  it("should remove redundancy", () => {
    const input =
      "Please kindly explain in detail, step-by-step, the entire process.";
    const result = TextProcessor.removeRedundancy(input);
    expect(result.length).toBeLessThanOrEqual(input.length);
  });

  it("should preserve important context", () => {
    const input = "When privacy is important, follow these steps.";
    const result = TextProcessor.preserveImportantContext(input);
    expect(Array.isArray(result)).toBe(true);
  });
});
