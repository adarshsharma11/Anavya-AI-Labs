import Link from "next/link";

const STEPS = [
  {
    title: "Paste a public URL",
    body: "No install, plugin, or account required to run the first scan.",
  },
  {
    title: "Read SEO, performance, and GEO",
    body: "One report for crawl issues, speed, accessibility, and AI-search files.",
  },
  {
    title: "Fix in priority order",
    body: "Ship the work that restores indexing and conversion first.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="w-full border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          How a scan works
        </p>
        <h2 className="mt-4 max-w-xl font-headline text-3xl font-semibold tracking-tight sm:text-4xl">
          Three steps. Then a list you can ship.
        </h2>
        <ol className="mt-14 divide-y divide-border border-y border-border">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-3 py-8 md:grid-cols-[4rem_minmax(0,16rem)_1fr] md:items-baseline"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted-foreground">
          Use the{" "}
          <Link href="/scanner" className="text-foreground underline-offset-4 hover:underline">
            website scanner
          </Link>{" "}
          for one URL, or the{" "}
          <Link
            href="/competitor-scanner"
            className="text-foreground underline-offset-4 hover:underline"
          >
            competitor scanner
          </Link>{" "}
          for a side-by-side report.
        </p>
      </div>
    </section>
  );
}
