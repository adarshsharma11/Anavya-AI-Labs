export const HOME_FAQS = [
  {
    question: "What is AEO/GEO?",
    answer:
      "AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) mean making your website easy for AI tools like ChatGPT, Gemini, and Perplexity to find, understand, and quote. It covers AI-crawler access in robots.txt, an llms.txt file, structured data, and clear answer-style content.",
  },
  {
    question: "Is the scan really free?",
    answer:
      "Yes. You can run your first scan for free, with no credit card required.",
  },
  {
    question: "Do I need an account to run a scan?",
    answer:
      "No. Paste a public URL and run your first scan without signing up.",
  },
  {
    question: "What does the scan check?",
    answer:
      "It checks SEO basics (titles, meta descriptions, headings, indexability, canonicals), performance (including Core Web Vitals such as INP), accessibility, and AI-search readiness (AI-crawler rules in robots.txt, llms.txt, and structured data).",
  },
  {
    question: "How long does a scan take?",
    answer:
      "About a minute. You get a ranked fix list, so you know what to fix first.",
  },
  {
    question: "Can I compare my site with a competitor?",
    answer:
      "Yes. The competitor scanner puts two sites side by side so you can see where you are ahead or behind.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function FaqSection() {
  return (
    <section className="w-full border-t border-border" aria-labelledby="home-faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
        <h2
          id="home-faq-heading"
          className="max-w-2xl font-headline text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          What are the common questions?
        </h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {HOME_FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none text-left text-base font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground transition group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
