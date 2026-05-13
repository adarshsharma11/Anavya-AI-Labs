"use client";

import React, { useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS, fetchSiteSettings, type SiteSettings } from "@/lib/api/settings";

interface PolicyLayoutProps {
  title: string;
  rawContent: string;
}

export function PolicyLayout({ title, rawContent }: PolicyLayoutProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetchSiteSettings().then((data) => setSettings(data));
  }, []);

  // Replace placeholders in the raw content
  let parsedContent = rawContent;
  parsedContent = parsedContent.replace(/\[Your Company Name\]/g, settings.companyName);
  parsedContent = parsedContent.replace(/\[your domain\]/g, settings.domain);
  parsedContent = parsedContent.replace(/\[DATE\]/g, settings.effectiveDate);
  parsedContent = parsedContent.replace(/\[email\]/g, settings.email);

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
    if (/^.+:\s*$/.test(line)) {
      return (
        <h3 key={index} className="text-lg font-semibold mt-8 mb-3 text-foreground">
          {line.replace(/:\s*$/, "")}
        </h3>
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
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/4 top-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute right-1/4 top-40 h-[30rem] w-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative border-b border-border/60 overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[260px] w-[260px] rounded-full bg-primary/20 opacity-25 blur-[100px]" />
        <div className="container max-w-6xl py-6 md:py-8 mx-auto px-3 md:px-4 relative z-10 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2">
            {title}
          </h1>
          {settings.effectiveDate && (
            <p className="text-muted-foreground text-sm md:text-base">
              Effective Date: {settings.effectiveDate}
            </p>
          )}
        </div>
      </div>
      <article className="container max-w-6xl py-8 md:py-10 mx-auto px-3 md:px-4">
        <div className="rounded-2xl border border-border/60 bg-transparent p-5 md:p-8 shadow-lg backdrop-blur">
          {lines.map((line, index) => renderLine(line.trim(), index))}
        </div>
      </article>
    </main>
  );
}
