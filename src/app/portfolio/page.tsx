"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

export default function PortfolioPage() {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const portfolioImages = PlaceHolderImages.filter((p) =>
    p.id.startsWith("portfolio-")
  );

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="container py-12 md:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Our Work
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Check out some of the amazing projects we've delivered for our
          clients.
        </p>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        initial="initial"
        animate="in"
        transition={{ staggerChildren: 0.2 }}
      >
        {portfolioImages.map((project) => (
          <motion.div
            key={project.id}
            variants={{
              initial: { opacity: 0, y: 20 },
              in: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                },
              },
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="flex h-full flex-col overflow-hidden">
              <div className="relative h-56 w-full">
                <Image
                  src={project.imageUrl}
                  alt={project.description}
                  data-ai-hint={project.imageHint}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline">
                  {project.description}
                </CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">Web App</Badge>
                  <Badge variant="secondary">UI/UX</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  A brief description of the project, highlighting the
                  challenges and our solutions.
                </CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" asChild>
                  <Link href="#">
                    View Case Study <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
