import { TokenCounter } from "../src/utils/tokenCounter";

describe("TokenCounter", () => {
  it("should estimate token count", () => {
    const text = "This is a test sentence.";
    const result = TokenCounter.estimate(text, "gpt-3.5-turbo");
    expect(result.tokens).toBeGreaterThan(0);
  });
});
