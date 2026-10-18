import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1400px] flex-col justify-center px-6 py-20 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 max-w-xl font-headline text-4xl font-semibold tracking-tight sm:text-5xl">
        This page is not here.
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        The URL may have moved, or it was never public. Scan a site or go back
        home.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/scanner"
          className="inline-flex h-11 items-center bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/90"
        >
          Run a free scan
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center px-5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
