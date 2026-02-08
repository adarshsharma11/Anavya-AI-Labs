"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "We shaved 1.8s off LCP and lifted checkout conversion by 22% within four weeks.",
    name: "Talia Brooks",
    role: "Head of Growth, RetailLab",
  },
  {
    quote:
      "Their AI scan caught issues our QA missed. The action plan was clear and fast to ship.",
    name: "Jonas Keller",
    role: "Product Lead, Driftly",
  },
  {
    quote:
      "The accessibility fixes paid for themselves in under a month. Support tickets dropped instantly.",
    name: "Renee Alvarez",
    role: "VP Product, AbleFi",
  },
  {
    quote:
      "We used the scan pack across five landing pages and found the exact flow causing drop-off.",
    name: "Mika Orlov",
    role: "Marketing Director, NovaPay",
  },
  {
    quote:
      "The insights were practical. Our dev team shipped fixes in days, not weeks.",
    name: "Priya Desai",
    role: "Engineering Manager, Flowgrid",
  },
  {
    quote:
      "Finally a report that ties performance fixes directly to revenue impact.",
    name: "Cameron West",
    role: "Founder, Brightlane",
  },
  {
    quote:
      "We launched our chatbot and reduced ticket volume by 35% in the first month.",
    name: "Elena Cruz",
    role: "Customer Ops, MesaCloud",
  },
  {
    quote:
      "Their UX guidance improved trial-to-paid conversion without adding complexity.",
    name: "Omar Haddad",
    role: "Growth Lead, Helio",
  },
];

export function FeedbackSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 },
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
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Client Feedback
          </p>
          <h2 className="mt-4 font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Teams trust us for measurable wins.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from teams who needed clarity, speed, and better
            conversions.
          </p>
        </div>

        <motion.div
          className="mt-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
            <div className="group flex min-w-full gap-6 py-2">
              <div className="flex min-w-full flex-none gap-6 animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
                {[...testimonials, ...testimonials].map((item, index) => (
                  <motion.div
                    key={`${item.name}-${index}`}
                    variants={itemVariants}
                    className="w-[320px] flex-none md:w-[360px]"
                  >
                    <Card className="h-full border-border/60 bg-background/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={`${item.name}-${starIndex}`}
                              className="h-4 w-4 fill-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
                          {index % 2 === 0 ? "Upwork" : "Fiverr"}
                        </span>
                      </div>
                      <p className="mt-6 text-base text-muted-foreground">
                        “{item.quote}”
                      </p>
                      <div className="mt-6">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
