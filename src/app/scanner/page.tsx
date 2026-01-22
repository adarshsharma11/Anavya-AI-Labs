"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScanResult, scanWebsite } from "@/lib/mock-api";
import ScannerResults from "@/components/scanner/scanner-results";
import { Progress } from "@/components/ui/progress";
import { ScanSkeleton } from "@/components/scanner/scan-skeleton";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

export default function ScannerPage() {
  const [scanState, setScanState] = useState<
    "idle" | "scanning" | "results" | "error"
  >("idle");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (scanState === "scanning") {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 400);

      return () => clearInterval(interval);
    }
  }, [scanState]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setScanState("scanning");
    setResults([]);
    setProgress(0);

    try {
      const scanResults = await scanWebsite(values.url);
      setResults(scanResults);
      setProgress(100);
      setScanState("results");
    } catch (error) {
      setScanState("error");
      setProgress(0);
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

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
          AI Website Scanner
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enter a URL to get an instant audit of its performance, SEO, and
          accessibility.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl">
        {scanState === "idle" && (
          <div className="mx-auto max-w-xl">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    "Scan Website"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="text-center">
            <h3 className="text-lg font-medium">Scanning your website...</h3>
            <Progress value={progress} className="mt-4" />
            <p className="mt-2 text-sm text-muted-foreground">
              {progress}% complete
            </p>
            <ScanSkeleton />
          </div>
        )}

        {(scanState === "results" || scanState === "error") && (
          <div>
            <ScannerResults results={results} />
            <div className="mt-8 text-center">
              <Button onClick={() => setScanState("idle")}>
                Scan Another Website
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
