import { PromptOptimizer } from "../src";
import { diffWords } from "diff";

function getVisualDiff(original: string, optimized: string): string {
  const diff = diffWords(original, optimized);

  let result = "";
  diff.forEach((part) => {
    // Green for additions, red for deletions, grey for unchanged
    const color = part.added
      ? "\x1b[32m"
      : part.removed
      ? "\x1b[31m"
      : "\x1b[90m";
    result += color + part.value + "\x1b[0m";
  });

  return result;
}

const optimizer = new PromptOptimizer({
  optimizeForModel: "gpt-4",
  maxTokens: 100,
});

const verbosePrompt = `
  Please kindly write a very detailed and verbose explanation about how to properly and correctly install Node.js 
  on your computer device, including but not limited to downloading, installing, verifying, and testing.
`;

const longPrompt = `
  I would like to respectfully ask you, if it’s not too much trouble, to possibly consider writing a highly elaborate and
  long-winded explanation about how one might go about the process of setting up Node.js on a computing device of your choosing.
  Please include as many steps as possible, and kindly ensure to explain everything in minute detail, without skipping anything.
`;

const optimized = optimizer.optimize(longPrompt);

console.log(optimized);

console.log(
  "\n\x1b[36m=== Difference after prompt optimization ===\x1b[0m\n" +
    getVisualDiff(longPrompt, optimized.optimizedPrompt) +
    "\n"
);
