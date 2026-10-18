"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { ScanReportFrame } from "./scan-report-frame";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1400px] items-center gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:px-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Anavya AI Labs
          </p>
          <h1 className="mt-5 font-headline text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            See what is blocking search, AI answers, and sales.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Scan a public URL for SEO, performance, and GEO. Get a ranked fix
            list in about a minute.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/scanner"
              className="inline-flex h-11 items-center bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              Run a free scan
            </Link>
            <Link
              href="/competitor-scanner"
              className="inline-flex h-11 items-center px-5 text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              Compare a competitor
            </Link>
          </div>
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
