# OptimLLM - Prompt Optimizer for LLMs

[![npm version](https://badge.fury.io/js/optimllm.svg)](https://badge.fury.io/js/optimllm)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A TypeScript library for optimizing LLM prompts to reduce tokens, save costs, and improve performance. Works with GPT, Claude, and other language models.

![Screenshot](screenshot.png)

## Features

- **Token Reduction**: Automatically remove redundant words and phrases
- **Cost Optimization**: Reduce API costs by up to 40%
- **Model-Specific**: Optimizations tailored for different LLMs
- **Performance**: Better outputs with cleaner, more focused prompts
- **TypeScript**: Full type safety and IntelliSense support
- **React/Next.js**: Built-in hooks and components

## Installation

```bash
npm install optimllm
# or
yarn add optimllm
```

## Quick Start

```bash
// For CommonJS
const { PromptOptimizer } = require('optimllm');

// For ES Modules or TypeScript
import { PromptOptimizer } from "optimllm";


const optimizer = new PromptOptimizer();
const result = optimizer.optimize("Write your prompt here");

console.log(result.optimizedPrompt); // Output: optimized prompt string

```

## Contributing

Your contributions are welcome. See CONTRIBUTING.md for guidelines.

## License

This project is licensed under the [MIT License](https://opensource.org/license/MIT)
