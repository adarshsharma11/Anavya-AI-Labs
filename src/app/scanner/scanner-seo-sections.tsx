import Link from "next/link";

import { getScannerSeoContent, type ScannerSeoVariant } from "./scanner-seo-content";

type ScannerSeoSectionsProps = {
  variant: ScannerSeoVariant;
};

export function ScannerSeoSections({ variant }: ScannerSeoSectionsProps) {
  const { sections, faqs, links } = getScannerSeoContent(variant);
  const faqHeading =
    variant === "website" ? "Website scanner FAQ" : "Competitor scanner FAQ";

  return (
    <div className="mx-auto mt-16 max-w-3xl space-y-12 text-left">
      {sections.map((section) => (
        <section key={section.title} aria-labelledby={`${variant}-${section.title}`}>
          <h2
            id={`${variant}-${section.title}`}
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base leading-7 text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {section.steps ? (
            <ol className="mt-6 space-y-4">
              {section.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-base font-medium">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ))}

      <section aria-labelledby={`${variant}-faq`}>
        <h2 id={`${variant}-faq`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {faqHeading}
        </h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none text-left text-base font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span aria-hidden="true" className="text-muted-foreground transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <nav aria-label="Related pages">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Related pages</h2>
        <ul className="mt-4 space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-medium underline-offset-4 hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
