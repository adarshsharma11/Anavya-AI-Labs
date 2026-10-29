export interface LlmsTxtRuleDoc {
  id: string;
  number: number;
  title: string;
  specClause: string;
  description: string;
  tip: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const CANONICAL_LLMS_TXT_TEMPLATE = `# Anavya AI Labs

> Anavya AI Labs provides generative engine optimization (GEO) and AI search visibility intelligence.

Anavya AI Labs analyzes how AI systems, search engines, and large language models (ChatGPT, Claude, Perplexity, Gemini) read and cite public websites.

## Documentation

- [Getting Started](https://anavyaailabs.com/scanner): Run a free automated website scan
- [Competitor Benchmark](https://anavyaailabs.com/competitor-scanner): Compare AI search readiness against competitors
- [llms.txt Guide](https://anavyaailabs.com/llms-txt-checker): Validate and optimize your llms.txt files

## Features & Services

- [GEO Optimization Services](https://anavyaailabs.com/services): End-to-end AI visibility audit and implementation
- [AI Search Blog](https://anavyaailabs.com/blog): In-depth technical articles on generative engine optimization

## Company

- [About Us](https://anavyaailabs.com/about): Our mission, methodology, and AI evaluation team
- [Contact Support](https://anavyaailabs.com/contact): Get in touch with our AI search engineers

## Optional

- [Release Changelog](https://anavyaailabs.com/changelog): Detailed platform updates and release notes
`;

export const SPEC_RULES: LlmsTxtRuleDoc[] = [
  {
    id: "markdown-format",
    number: 1,
    title: "Markdown Format (H1 & H2 Only)",
    specClause: "markdown-format",
    description:
      "The file must be raw plain Markdown. The specification permits only H1 (#) and H2 (##) headings. Headings deeper than H2 (###, ####) or HTML/frontmatter violate parser compatibility.",
    tip: "Use bold text (**Subheading**) for inner sections instead of ###.",
  },
  {
    id: "h1-title",
    number: 2,
    title: "Project Title (H1)",
    specClause: "h1-title",
    description:
      "The file must open with exactly one H1 heading containing the project or organization name. This is the single mandatory requirement per the llmstxt.org specification.",
    tip: "Start line 1 with `# Your Site Name`.",
  },
  {
    id: "blockquote-summary",
    number: 3,
    title: "Blockquote Summary",
    specClause: "blockquote-summary",
    description:
      "Directly following the H1, include a concise 1–2 sentence summary inside a blockquote (`> Summary`). This gives AI models instant high-level context before reading any links.",
    tip: "Write a high-density summary: what your product does and who it serves.",
  },
  {
    id: "project-details",
    number: 4,
    title: "Detail Blocks Without Headings",
    specClause: "project-details",
    description:
      "Zero or more markdown blocks (paragraphs, lists, tables) can precede the first H2 section. These blocks must NOT contain any headings.",
    tip: "Add introductory guidance or usage constraints here without using ###.",
  },
  {
    id: "file-lists",
    number: 5,
    title: "H2 Sections & Absolute URLs",
    specClause: "file-lists",
    description:
      "Organize curated links under `## Section Name` headings. Each entry must follow `- [Name](https://...): optional notes`. Relative links are invalid because AI crawlers require absolute URLs.",
    tip: "Always use full https:// URLs and separate notes with a colon (: ).",
  },
  {
    id: "optional-section",
    number: 6,
    title: "The Special Optional Section",
    specClause: "optional-section",
    description:
      "A section titled exactly `## Optional` signals to AI systems that its links are secondary or verbose and may be safely skipped when context windows are constrained.",
    tip: "Place release changelogs, full archives, and secondary guides under ## Optional at the end of the file.",
  },
];

export const LLMS_TXT_FAQS: FaqItem[] = [
  {
    question: "What is an llms.txt file?",
    answer:
      "An llms.txt file is a lightweight, standardized Markdown file hosted at the root of a website (yourdomain.com/llms.txt) designed specifically for Large Language Models and AI crawlers (ChatGPT, Claude, Perplexity, Gemini). It provides a curated index of the site's most important documentation and content in clean, parseable text.",
  },
  {
    question: "Where should the llms.txt file be hosted?",
    answer:
      "It must be published at your site's root: https://yourdomain.com/llms.txt. It should be served with an HTTP 200 status code and Content-Type text/markdown or text/plain.",
  },
  {
    question: "Does llms.txt replace robots.txt or sitemap.xml?",
    answer:
      "No. robots.txt governs crawling permissions, and sitemap.xml lists all indexed URLs for traditional search engines. llms.txt complements them by telling AI systems which pages are high-value and provides them directly in an LLM-friendly, token-efficient format.",
  },
  {
    question: "Is the blockquote summary mandatory?",
    answer:
      "Per the llmstxt.org specification, the H1 title is the only strictly mandatory element. However, the blockquote summary is strongly recommended because it immediately sets the context for AI agents before they evaluate your link hierarchy.",
  },
  {
    question: "Why does the specification forbid H3 (###) headings?",
    answer:
      "The llmstxt.org format was intentionally engineered with a flat 2-level hierarchy (H1 for project, H2 for sections). This constraint makes files human-readable and trivially parseable by programmatic LLM ingestors without heading-level ambiguity.",
  },
  {
    question: "What is the difference between llms.txt and llms-full.txt?",
    answer:
      "llms.txt serves as a concise index of links and summaries. llms-full.txt is an optional companion file that bundles the full, expanded text of all core documentation into one continuous Markdown file for immediate context ingestion.",
  },
  {
    question: "Do I need to log in or create an account to use this checker?",
    answer:
      "No. Anavya AI Labs provides this tool completely free with no registration or credit card required. You can check published URLs, validate raw text, and generate drafts instantly.",
  },
];

