import Link from "next/link";

export function CtaSection() {
  return (
    <section className="w-full border-t border-border bg-foreground text-background">
      <div className="mx-auto flex min-h-[50vh] max-w-[1400px] flex-col justify-end px-6 py-20 lg:px-12">
        <h2 className="max-w-3xl font-headline text-4xl font-semibold tracking-tight sm:text-5xl">
          How do you fix what search and AI cannot see?
        </h2>
        <div className="mt-10">
          <Link
            href="/scanner"
            className="inline-flex h-11 items-center bg-background px-5 text-sm font-medium text-foreground transition hover:bg-background/90"
          >
            Run a free scan
          </Link>
        </div>
      </div>
    </section>
  );
}
