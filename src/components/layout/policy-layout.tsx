"use client";

import React, { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/api/settings";

interface PolicyLayoutProps {
  title: string;
  rawContent: string;
}

export function PolicyLayout({ title, rawContent }: PolicyLayoutProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSiteSettings().then((data) => setSettings(data));
  }, []);

  // Replace placeholders in the raw content
  let parsedContent = rawContent;
  if (settings) {
    parsedContent = parsedContent.replace(/\[Your Company Name\]/g, settings.companyName);
    parsedContent = parsedContent.replace(/\[your domain\]/g, settings.domain);
    parsedContent = parsedContent.replace(/\[DATE\]/g, settings.effectiveDate);
    parsedContent = parsedContent.replace(/\[email\]/g, settings.email);
  } else {
    // Show loading state or skeleton for text if settings aren't loaded yet?
    // We will just use the un-replaced placeholders until loaded to avoid layout shift,
    // or return a loader. Returning a loader is safer.
    return (
      <main className="flex-1 container max-w-4xl py-16 md:py-24 mx-auto px-4 md:px-8">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
        </div>
      </main>
    );
  }

  // Very simple Markdown-ish to HTML rendering since the provided content is plain text with numbers and dashes
  const renderLine = (line: string, index: number) => {
    // Check if it's a heading (e.g. "1. Who we are")
    if (/^\d+\.\s.+$/.test(line)) {
      return (
        <h2 key={index} className="text-xl font-bold mt-8 mb-4 text-foreground">
          {line}
        </h2>
      );
    }
    // Check if it's a list item (e.g. "- URLs you submit")
    if (line.startsWith("- ")) {
      return (
        <li key={index} className="ml-6 mb-2 text-muted-foreground list-disc marker:text-primary/70">
          {line.substring(2)}
        </li>
      );
    }
    // Check if it's "Effective date:"
    if (line.startsWith("Effective date:")) {
      return null;
    }
    // Check if empty line
    if (!line.trim()) {
      return <div key={index} className="h-4" aria-hidden="true" />;
    }
    
    // Normal paragraph
    return (
      <p key={index} className="mb-5 text-muted-foreground leading-relaxed">
        {line}
      </p>
    );
  };

  const lines = parsedContent.split("\n");

  return (
    <main className="flex-1 bg-slate-50/50 dark:bg-transparent">
      <div className="relative border-b overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        <div className="container max-w-4xl py-16 md:py-24 mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            {title}
          </h1>
          {settings?.effectiveDate && (
            <p className="text-muted-foreground text-lg">
              Effective Date: {settings.effectiveDate}
            </p>
          )}
        </div>
      </div>
      <article className="container max-w-3xl py-12 md:py-20 mx-auto px-4 md:px-8">
        <div className="bg-card rounded-2xl shadow-sm border p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80">
          {lines.map((line, index) => renderLine(line.trim(), index))}
        </div>
      </article>
    </main>
  );
}
