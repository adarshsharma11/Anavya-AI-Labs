export type ScannerSeoVariant = "website" | "competitor";

export type ScannerFaq = {
  question: string;
  answer: string;
};

export type ScannerStep = {
  title: string;
  body: string;
};

export type ScannerSection = {
  title: string;
  paragraphs: readonly string[];
  steps?: readonly ScannerStep[];
};

export type ScannerLink = {
  href: string;
  label: string;
};

export type ScannerSeoContent = {
  sections: readonly ScannerSection[];
  faqs: readonly ScannerFaq[];
  links: readonly ScannerLink[];
};

const websiteContent: ScannerSeoContent = {
  sections: [
    {
      title: "What this scan checks",
      paragraphs: [
        "The website scanner reads one public URL and reports what a search crawler and an answer engine can see. It checks SEO basics: the title, the meta description, headings, the canonical link, and whether the page is allowed to be indexed.",
        "It checks speed signals tied to Core Web Vitals, including how long the main content takes to appear, how quickly the page responds to input (Interaction to Next Paint), and how large the document is. It checks AI-search readiness for ChatGPT, Perplexity, and Gemini: robots.txt rules for their crawlers, an llms.txt file, a sitemap, JSON-LD, and whether the page gives a direct answer a model can quote.",
        "Accessibility issues and common security headers are part of the same pass. The scan uses the public page only. It does not log in, install code, or change your site.",
      ],
    },
    {
      title: "What you get in the report",
      paragraphs: [
        "The report gives a score, a ranked fix list, and the evidence for each item. Items at the top are the ones most likely to block indexing, slow the page, or keep ChatGPT, Perplexity, or Gemini from citing you. Each item names the check, states what was found, and gives a fix you can hand to a developer.",
        "You can copy a link to the report. From the results view you can download a PDF. This page is a one-site audit. It does not estimate traffic and it does not claim a Google ranking. Comparing two sites is a different tool, the competitor scanner.",
      ],
    },
    {
      title: "How it works",
      paragraphs: [
        "A typical scan finishes in about a minute. You do not install a plugin.",
      ],
      steps: [
        {
          title: "Paste a public URL",
          body: "The first scan does not ask for an account or a card.",
        },
        {
          title: "The scanner fetches the page",
          body: "It also requests robots.txt, the sitemap, and structured data around that URL.",
        },
        {
          title: "Read the ranked list",
          body: "Start at the top. Those items are the ones to fix before the rest of the list.",
        },
      ],
    },
    {
      title: "Who it's for",
      paragraphs: [
        "SEO teams use it before a release to see index and AI-crawler gaps. Agencies use it to show a client one ordered list instead of screenshots from several tools.",
        "Site owners use it when a page looks finished but is not being recommended in Google or in ChatGPT, Perplexity, or Gemini. If the next step is implementation rather than another scan, the services page describes that work.",
      ],
    },
  ],
  faqs: [
    {
      question: "What does the website scanner check?",
      answer:
        "It checks SEO basics (title, meta description, headings, canonical, indexability), Core Web Vitals and page weight, accessibility, security headers, and AI-search files for ChatGPT, Perplexity, and Gemini, including robots.txt, llms.txt, a sitemap, and JSON-LD.",
    },
    {
      question: "What is in the report?",
      answer:
        "A score, a ranked fix list, and the evidence behind each fix. You can share a link and download a PDF from the results view.",
    },
    {
      question: "Do I need an account?",
      answer:
        "No. Paste a public URL to run the first scan. There is no plugin to install.",
    },
    {
      question: "Who should use it?",
      answer:
        "SEO teams, agencies, and site owners who want one ordered list of what to fix for search and for AI answers.",
    },
  ],
  links: [
    { href: "/competitor-scanner", label: "Competitor scanner" },
    { href: "/blog", label: "Blog" },
    {
      href: "/blog/why-chatgpt-and-perplexity-dont-cite-your-website",
      label: "Why ChatGPT and Perplexity may not cite a page",
    },
    { href: "/services", label: "Services" },
  ],
};

const competitorContent: ScannerSeoContent = {
  sections: [
    {
      title: "What this comparison checks",
      paragraphs: [
        "The competitor scanner fetches two public URLs and runs the same checks on both. It looks at SEO basics: titles, meta descriptions, headings, canonicals, and indexability. It compares speed signals, including Core Web Vitals and page weight, so you can see which page is slower to show content or respond to input.",
        "It compares AI-search readiness for ChatGPT, Perplexity, and Gemini: crawler rules in robots.txt, llms.txt, sitemaps, and JSON-LD. Accessibility gaps and security-header gaps are included. It does not estimate traffic, and it does not claim that one site outranks the other in Google.",
      ],
    },
    {
      title: "What you get in the report",
      paragraphs: [
        "You get scores for both sites and a ranked list of gaps. Each item says which site is behind, what was found, and a fix aimed at your site. Use it to decide what to change, not to copy the other site's wording.",
        "You can share the report with a link and download a PDF from the results view. If you only have one URL, run the website scanner first and come back when you have a second public page to compare.",
      ],
    },
    {
      title: "How it works",
      paragraphs: [
        "A typical comparison takes about a minute. Both pages have to be public. There is no plugin.",
      ],
      steps: [
        {
          title: "Enter two public URLs",
          body: "One is your site. The other is the competitor page you want to line up against it.",
        },
        {
          title: "The scanner checks both",
          body: "SEO, speed, accessibility, and AI-search files are collected for each URL.",
        },
        {
          title: "Read the gap list from the top",
          body: "The first items are the differences most worth fixing on your site.",
        },
      ],
    },
    {
      title: "Who it's for",
      paragraphs: [
        "SEO teams use it when another page is the one being cited in search or in AI answers. Agencies use it in a review to show a concrete gap instead of a general opinion.",
        "Site owners use it to tell whether the problem is their page or just the field they are in. For a single URL with no comparison, use the website scanner. To talk through the fixes, use the contact page.",
      ],
    },
  ],
  faqs: [
    {
      question: "What does the competitor scanner compare?",
      answer:
        "Two public websites, across SEO basics, Core Web Vitals, accessibility, security headers, and AI-search files such as robots.txt, llms.txt, sitemaps, and JSON-LD.",
    },
    {
      question: "What is in the comparison report?",
      answer:
        "Scores for both sites and a ranked gap list. Each item names the check, which site is behind, and a fix. You can share a link and download a PDF.",
    },
    {
      question: "Does it tell me who ranks higher?",
      answer:
        "No. It does not estimate traffic and it does not claim a Google ranking. It compares the on-page and technical signals the scanner can see.",
    },
    {
      question: "Who should use it?",
      answer:
        "SEO teams, agencies, and site owners who want a side-by-side list of gaps before they decide what to fix.",
    },
  ],
  links: [
    { href: "/scanner", label: "Website scanner" },
    { href: "/blog", label: "Blog" },
    {
      href: "/blog/how-to-compare-two-websites-seo-and-ai-visibility",
      label: "How to compare two websites",
    },
    { href: "/contact", label: "Contact" },
  ],
};

export function getScannerSeoContent(variant: ScannerSeoVariant): ScannerSeoContent {
  return variant === "website" ? websiteContent : competitorContent;
}
