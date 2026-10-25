"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { getValidScanUrl } from "@/app/scanner/scanner-utils";
import { Input } from "@/components/ui/input";

import { ScanReportFrame } from "./scan-report-frame";

function HeroScanIntent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const intent = searchParams.get("intent");
    if (intent === "scan" || intent === "unlock") {
      document.getElementById("hero-scan-url")?.focus();
    }
  }, [searchParams]);

  return null;
}

export function HeroSection() {
  const router = useRouter();
  const [urlValue, setUrlValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = getValidScanUrl(urlValue);

    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setErrorMessage(null);
    router.push(`/scanner?url=${encodeURIComponent(validation.normalized)}`);
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1400px] items-center gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:px-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-xl"
        >
          <Suspense fallback={null}>
            <HeroScanIntent />
          </Suspense>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Anavya AI Labs
          </p>
          <h1 className="mt-5 font-headline text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            Find out why ChatGPT and Google don&apos;t recommend your website
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            ChatGPT and Google skip a website when they cannot crawl it, quote
            a direct answer, or load it quickly. Anavya AI Labs scans one public
            URL for SEO, speed, and AI visibility, then returns a ranked fix
            list in about 60 seconds. You see blocked crawlers, a missing
            llms.txt, weak headings, and slow pages before you rewrite the site.
            The first scan is free and needs no install.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-3" noValidate>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <label className="sr-only" htmlFor="hero-scan-url">
                Website URL
              </label>
              <Input
                id="hero-scan-url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="https://yourwebsite.com"
                value={urlValue}
                onChange={(event) => {
                  setUrlValue(event.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? "hero-scan-url-error" : undefined}
                className="h-11 flex-1 bg-background"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/90"
              >
                Scan my website
              </button>
            </div>
            <p
              id="hero-scan-url-error"
              role="alert"
              className="min-h-5 text-sm text-destructive"
            >
              {errorMessage ?? ""}
            </p>
            <Link
              href="/competitor-scanner"
              className="inline-flex h-10 items-center text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              Compare a competitor
            </Link>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, rotateY: -18, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateY: -14, rotateX: 8 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="[perspective:1400px]"
        >
          <div
            className="origin-center [transform:rotateY(-14deg)_rotateX(8deg)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <ScanReportFrame stage={3} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
