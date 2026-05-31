"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { getScannerSeoContent } from "./scanner-seo-content";

type ScannerSeoSectionsProps = {
  variant: "website" | "competitor";
};

export function ScannerSeoSections({ variant }: ScannerSeoSectionsProps) {
  const isWebsite = variant === "website";
  const { reasons, faqs } = getScannerSeoContent(variant);

  return (
    <div className="mx-auto mt-16 max-w-5xl space-y-10">
      <section aria-labelledby={`${variant}-why-use`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id={`${variant}-why-use`}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {isWebsite
              ? "Why Use Our AI Website Scanner"
              : "Why Use Our AI Competitor Scanner"}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {isWebsite
              ? "The homepage already covers how the process works, so this page focuses on why teams use the scanner and what they get from it."
              : "This page focuses on why competitor benchmarking matters and what your team can learn from side-by-side AI analysis."}
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reasons.map((reason) => (
            <Card
              key={reason.title}
              className="border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <reason.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{reason.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby={`${variant}-faq`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id={`${variant}-faq`}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {isWebsite ? "Website Scanner FAQs" : "Competitor Scanner FAQs"}
          </h2>
        </div>
        <Card className="mt-8 border-border/60 bg-background/80 p-2 shadow-sm backdrop-blur sm:p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`${variant}-faq-${index}`}
                className="border-border/60 px-4"
              >
                <AccordionTrigger className="py-5 text-left text-lg font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="pr-6 text-sm"
                  >
                    {item.answer}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </section>

      <section aria-labelledby={`${variant}-cta`}>
        <Card className="border-border/60 bg-background/80 p-8 text-center shadow-lg backdrop-blur">
          <h2 id={`${variant}-cta`} className="text-2xl font-semibold sm:text-3xl">
            {isWebsite ? "Need competitor context too?" : "Need a one-site audit first?"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {isWebsite
              ? "Use the dedicated competitor scanner page when you want to benchmark your site against another website."
              : "Use the main website scanner when you want a focused audit for a single site before comparing it with competitors."}
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href={isWebsite ? "/competitor-scanner" : "/scanner"}
              className="rounded-full border border-border/60 bg-background px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {isWebsite ? "Open competitor scanner" : "Open website scanner"}
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
