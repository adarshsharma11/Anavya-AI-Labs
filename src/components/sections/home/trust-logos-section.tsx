"use client";

import { motion } from "framer-motion";

const logos = ["Acme", "Stark", "Wayne", "Globex", "Umbrella", "Cyberdyne", "Ollivanders"];

export function TrustLogosSection() {
  return (
    <section className="py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-center text-sm font-semibold text-muted-foreground">
            Trusted by the world's most innovative companies
          </p>
          <div className="relative mt-10 w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
            <div className="flex animate-[marquee_40s_linear_infinite] min-w-full flex-shrink-0 items-center">
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={`${logo}-${index}`}
                  className="mx-8 flex flex-shrink-0 justify-center"
                >
                  <span className="whitespace-nowrap text-2xl font-bold text-muted-foreground/60">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
