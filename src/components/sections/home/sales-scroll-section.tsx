"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { ScanReportFrame, type ReportStage } from "./scan-report-frame";

const SCENES = [
  {
    title: "A site that looks finished",
    body: "Most teams ship a polished homepage and assume search will follow. The public page is only the first layer.",
  },
  {
    title: "The crawl and GEO gaps show up",
    body: "Missing llms.txt, blocked AI bots, weak schema, and slow INP are the issues that keep pages out of results.",
  },
  {
    title: "That is where sales leak",
    body: "If Google and ChatGPT cannot cite you, the pages built to convert never get the visit. The report makes that visible.",
  },
  {
    title: "Then you get a ranked fix list",
    body: "One scan. Priority order. Ship the work that restores crawl, AI citations, and conversion.",
  },
] as const;

export function SalesScrollSection() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const [stage, setStage] = useState<ReportStage>(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next: ReportStage =
      value < 0.25 ? 0 : value < 0.5 ? 1 : value < 0.75 ? 2 : 3;
    setStage((current) => (current === next ? current : next));
  });

  const rotateY = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [-22, -8, 12, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [12, 3]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  if (reduceMotion) {
    return (
      <section className="w-full border-t border-border">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              From page to revenue
            </p>
            <h2 className="mt-4 font-headline text-3xl font-semibold tracking-tight sm:text-4xl">
              {SCENES[3].title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {SCENES[3].body}
            </p>
          </div>
          <ScanReportFrame stage={3} />
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[320vh] w-full border-t border-border">
      <div className="sticky top-16 flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-6 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] lg:px-12">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              From page to revenue
            </p>
            <h2 className="mt-4 font-headline text-3xl font-semibold tracking-tight sm:text-4xl">
              {SCENES[stage].title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {SCENES[stage].body}
            </p>
            <ol className="mt-8 space-y-2 text-sm text-muted-foreground">
              {SCENES.map((scene, index) => (
                <li
                  key={scene.title}
                  className={index === stage ? "text-foreground" : undefined}
                >
                  <span className="mr-3 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {scene.title}
                </li>
              ))}
            </ol>
          </div>

          <div className="[perspective:1600px]">
            <motion.div
              style={{ rotateY, rotateX, scale, transformStyle: "preserve-3d" }}
              className="origin-center will-change-transform"
            >
              <ScanReportFrame stage={stage} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
