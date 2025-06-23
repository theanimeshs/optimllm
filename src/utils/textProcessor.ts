export class TextProcessor {
  private static readonly DEFAULT_STOP_WORDS = new Set([
    "please",
    "could",
    "would",
    "can",
    "may",
    "might",
    "should",
    "i would like",
    "it would be great",
    "if possible",
    "thank you",
    "i need",
    "help me",
    "assist me",
    "i want",
    "i am looking for",
    "could you",
    "would you",
    "can you",
    "please help",
    "i wonder",
    "do you think",
    "what do you think",
    "in my opinion",
    "i believe",
    "i think",
    "perhaps",
    "maybe",
    "possibly",
    "probably",
  ]);

  private static readonly DEFAULT_ABBREVIATIONS = new Map([
    ["information", "info"],
    ["configuration", "config"],
    ["application", "app"],
    ["function", "func"],
    ["example", "e.g."],
    ["for instance", "e.g."],
    ["for example", "e.g."],
    ["documentation", "docs"],
    ["repository", "repo"],
    ["environment", "env"],
    ["development", "dev"],
    ["production", "prod"],
    ["database", "db"],
    ["parameter", "param"],
    ["parameters", "params"],
    ["variable", "var"],
    ["variables", "vars"],
    ["implement", "build"],
    ["demonstrate", "show"],
    ["utilize", "use"],
    ["facilitate", "help"],
    ["comprehensive", "full"],
    ["additional", "extra"],
    ["requirements", "reqs"],
    ["specification", "spec"],
    ["specifications", "specs"],
  ]);

  static removeStopWords(text: string, customStopWords?: string[]): string {
    const stopWords = new Set([
      ...this.DEFAULT_STOP_WORDS,
      ...(customStopWords || []),
    ]);

    // Handle phrase-level stop words first
    let result = text;
    for (const phrase of stopWords) {
      if (phrase.includes(" ")) {
        const regex = new RegExp(`\\b${this.escapeRegex(phrase)}\\b`, "gi");
        result = result.replace(regex, "");
      }
    }

    // Handle single word stop words
    const words = result.split(/\s+/);
    const filteredWords = words.filter((word) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
      return !stopWords.has(cleanWord);
    });

    return filteredWords.join(" ").replace(/\s+/g, " ").trim();
  }

  static applyAbbreviations(
    text: string,
    customAbbreviations?: Map<string, string>
  ): string {
    const abbreviations = new Map([
      ...this.DEFAULT_ABBREVIATIONS,
      ...(customAbbreviations || new Map()),
    ]);

    let result = text;
    for (const [full, abbrev] of abbreviations) {
      const regex = new RegExp(`\\b${this.escapeRegex(full)}\\b`, "gi");
      result = result.replace(regex, abbrev);
    }

    return result;
  }

  static removeRedundancy(text: string): string {
    // Remove repeated phrases
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const uniqueSentences = [
      ...new Set(sentences.map((s) => s.trim().toLowerCase())),
    ].map((s) => {
      // Find the original case version
      return sentences.find((orig) => orig.trim().toLowerCase() === s) || s;
    });

    let result = uniqueSentences.join(". ").trim();
    if (result && !result.match(/[.!?]$/)) {
      result += ".";
    }

    // Remove redundant adjectives and adverbs
    result = result.replace(
      /\b(very|really|quite|extremely|incredibly)\s+/gi,
      ""
    );

    // Remove redundant conjunctions
    result = result.replace(
      /\b(and also|but however|so therefore)\b/gi,
      (match) => match.split(" ")[0]
    );

    return result;
  }

  static cleanWhitespace(text: string): string {
    return text
      .replace(/\s+/g, " ") // Multiple spaces to single
      .replace(/\n\s*\n/g, "\n") // Multiple newlines to single
      .trim();
  }

  static preserveImportantContext(
    text: string,
    keywords: string[] = []
  ): string[] {
    const importantPatterns = [
      /\b(must|required|essential|critical|important|necessary)\b/gi,
      /\b(do not|don't|never|avoid|prevent)\b/gi,
      /\b(exactly|precisely|specifically|only)\b/gi,
      ...keywords.map(
        (keyword) => new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, "gi")
      ),
    ];

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const importantSentences: string[] = [];

    sentences.forEach((sentence) => {
      if (importantPatterns.some((pattern) => pattern.test(sentence))) {
        importantSentences.push(sentence.trim());
      }
    });

    return importantSentences;
  }

  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
