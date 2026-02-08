"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Gauge,
  Palette,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
}

const services: Service[] = [
  {
    icon: Bot,
    title: "AI Chatbot Development",
    description:
      "Support, onboarding, and lead capture bots that feel human and drive measurable deflection.",
    tags: ["Chatbot", "CX", "Automation"],
  },
  {
    icon: BrainCircuit,
    title: "Custom AI Workflows",
    description:
      "Domain-specific models, prompt systems, and evaluation loops built for your KPIs.",
    tags: ["AI Ops", "LLMs", "Workflow"],
  },
  {
    icon: Gauge,
    title: "Performance Optimization",
    description:
      "Core Web Vitals improvements with engineering-grade fixes and monitoring.",
    tags: ["LCP", "CLS", "Speed"],
  },
  {
    icon: Palette,
    title: "UX & Conversion Design",
    description:
      "Intent mapping, flow redesigns, and UI upgrades that move conversion rates.",
    tags: ["UX", "CRO", "Research"],
  },
  {
    icon: ShieldCheck,
    title: "Accessibility & Compliance",
    description:
      "Audits and remediation that protect your brand and open new audiences.",
    tags: ["A11y", "WCAG", "Trust"],
  },
  {
    icon: Rocket,
    title: "Launch & Growth Support",
    description:
      "Experiment roadmaps and growth loops that compound every release.",
    tags: ["Growth", "Experimentation", "KPIs"],
  },
];

const process = [
  {
    title: "Diagnose",
    description:
      "Deep scan your stack, flows, and user intent to find the exact blockers.",
  },
  {
    title: "Design",
    description:
      "Build the plan with clear priorities, quick wins, and measurable outcomes.",
  },
  {
    title: "Deliver",
    description:
      "Ship improvements fast, track impact, and iterate with real-time insights.",
  },
];

export default function ServicesClient() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

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

      <section className="container py-12 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Services
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            The AI + product partner for teams that ship fast.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            We blend AI diagnostics, product strategy, and performance
            engineering so your team can launch improvements with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              UX + AI Strategy
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              Conversion Design
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              Performance Wins
            </Badge>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/scanner">Run a free scan</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/portfolio">See outcomes</Link>
            </Button>
          </div>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={itemVariants}>
              <Card className="flex h-full flex-col gap-6 border-border/60 bg-background/80 p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <service.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              A delivery model built for clarity and speed.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every engagement starts with a clear diagnostic and ends with a
              measurable outcome. You always know what we are shipping next.
            </p>
          </div>
          <div className="grid gap-4">
            {process.map((step) => (
              <Card
                key={step.title}
                className="border-border/60 bg-background/80 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
