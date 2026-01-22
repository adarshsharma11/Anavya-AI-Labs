"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AboutPage() {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const aboutImage = PlaceHolderImages.find((p) => p.id === "about-team");

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="container py-12 md:py-24"
    >
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
            Our Mission
          </h1>
          <p className="text-lg text-muted-foreground">
            At anavyaailabs.com, our mission is to empower businesses of all sizes
            to create better, faster, and more accessible web experiences for
            everyone. We believe that a high-performing website is not a luxury,
            but a fundamental right for every user and a critical asset for
            every business.
          </p>
          <p className="text-lg text-muted-foreground">
            The web is complex and constantly evolving. It's easy to overlook
            small issues that can have a big impact on user experience and
            business outcomes. Our AI-driven tools are designed to cut through
            this complexity, providing clear, actionable insights that
            developers, marketers, and business owners can use to make
            meaningful improvements.
          </p>
        </div>
        <div className="relative h-80 w-full overflow-hidden rounded-xl md:h-full">
          {aboutImage && (
            <Image
              src={aboutImage.imageUrl}
              alt={aboutImage.description}
              data-ai-hint={aboutImage.imageHint}
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
