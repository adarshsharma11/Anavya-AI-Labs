"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-secondary/50 px-6 py-20 text-center shadow-lg sm:px-16">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to see what&apos;s holding your website back?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Get your free, no-obligation website analysis now and start
              turning visitors into customers.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/scanner">Get Your Free Scan</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
