"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const highlights = [
  { label: "Conversion Lift", value: "38%" },
  { label: "LCP Improvement", value: "1.6s" },
  { label: "Form Drop-Off", value: "-28%" },
  { label: "Time to Launch", value: "21 days" },
];

const outcomes = [
  "Reduced render-blocking scripts and shipped critical CSS.",
  "Rebuilt the onboarding funnel with intent-based messaging.",
  "Introduced AI-powered recommendations for next actions.",
  "Improved mobile checkout with clearer trust signals.",
];

const timeline = [
  { week: "Week 1", detail: "Discovery, audits, and UX intent mapping." },
  { week: "Week 2", detail: "Design iterations and performance fixes." },
  { week: "Week 3", detail: "Launch, QA, and conversion tuning." },
];

export default function CaseStudyClient() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
            <Badge className="rounded-full">Case Study</Badge>
            SaaS Growth Platform
          </div>
          <h1 className="mt-6 font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            From slow funnels to high-conversion onboarding.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            How Anavya AI Labs helped a B2B SaaS platform accelerate performance,
            reduce friction, and unlock measurable growth in three weeks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["AI Strategy", "Performance", "CRO", "UX"].map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full px-4 py-2">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-lg">
          <div className="relative h-72 w-full md:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
              alt="Product team collaborating"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 70vw"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {highlights.map((item) => (
            <Card
              key={item.label}
              className="border-border/60 bg-background/80 p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">The challenge</h2>
            <p className="mt-4 text-muted-foreground">
              The client’s onboarding flow suffered from slow load times, unclear
              next steps, and inconsistent messaging across devices. Conversion
              rates flattened and paid traffic efficiency dropped.
            </p>
            <h3 className="mt-8 text-2xl font-semibold">Our approach</h3>
            <p className="mt-3 text-muted-foreground">
              We combined AI diagnostics with human-led intent mapping to
              identify the highest-impact fixes. Each sprint delivered a
              measurable outcome tied to conversion lift.
            </p>
            <div className="mt-6 space-y-3">
              {outcomes.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/60 bg-background/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              {timeline.map((item) => (
                <div key={item.week} className="flex items-start justify-between gap-4">
                  <span className="font-semibold text-foreground">{item.week}</span>
                  <span>{item.detail}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Tools Used
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Lighthouse", "Figma", "Next.js", "GA4"].map((tool) => (
                  <Badge key={tool} variant="secondary" className="rounded-full">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="container pb-20">
        <Card className="border-border/60 bg-gradient-to-br from-foreground/5 via-background to-background p-8 shadow-lg md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to build your own growth story?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Get a tailored action plan from our AI + performance team and
                ship measurable wins in weeks.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/scanner">
                  Run a free scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">Book a consultation</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </motion.div>
  );
}
