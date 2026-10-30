"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Code,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileSearch,
  FileText,
  Globe,
  Info,
  Link2,
  Loader2,
  Quote,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  checkLlmsTxtUrl,
  generateLlmsTxt,
  validateLlmsTxtContent,
} from "@/lib/api/llms-txt";
import type {
  GeneratorResult,
  LlmsTxtValidationResult,
  UrlCheckResult,
  ValidationFinding,
} from "@/types/llms-txt";

import {
  CANONICAL_LLMS_TXT_TEMPLATE,
  LLMS_TXT_FAQS,
  SPEC_RULES,
} from "./llms-txt-seo-content";

type Mode = "url" | "paste" | "generate";

interface ScoreTheme {
  grade: string;
  text: string;
  bg: string;
  border: string;
  ring: string;
}

function getScoreTheme(score: number): ScoreTheme {
  if (score >= 85) {
    const grade = score >= 95 ? "A+" : "A";
    return {
      grade,
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      ring: "stroke-emerald-500",
    };
  }
  if (score >= 70) {
    return {
      grade: "B",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      ring: "stroke-emerald-500",
    };
  }
  if (score >= 60) {
    return {
      grade: "C",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      ring: "stroke-amber-500",
    };
  }
  if (score >= 40) {
    return {
      grade: "D",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      ring: "stroke-amber-500",
    };
  }
  return {
    grade: "F",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    ring: "stroke-rose-500",
  };
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ParsedSection {
  title: string;
  linkCount: number;
  nonLinkLines: number;
  isOptional: boolean;
}

interface MarkdownStats {
  title: string | null;
  sectionCount: number;
  linkCount: number;
  byteLength: number;
  wordCount: number;
  lineCount: number;
  sections: ParsedSection[];
  hasOptionalSection: boolean;
  optionalIsLast: boolean;
}

function computeMarkdownStats(markdown: string): MarkdownStats {
  const clean = (markdown ?? "").replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/);
  const lineCount = clean.trim() ? lines.length : 0;
  const wordCount = clean.trim() ? clean.trim().split(/\s+/).filter(Boolean).length : 0;
  const byteLength = new TextEncoder().encode(clean).length;

  let title: string | null = null;
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const h1Match = /^#\s+(.*)$/.exec(line);
    if (h1Match && !title) {
      title = h1Match[1].trim();
      continue;
    }

    const h2Match = /^##\s+(.*)$/.exec(line);
    if (h2Match) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const sTitle = h2Match[1].trim();
      currentSection = {
        title: sTitle,
        linkCount: 0,
        nonLinkLines: 0,
        isOptional: /^optional$/i.test(sTitle),
      };
      continue;
    }

    if (currentSection) {
      if (/^[-*+]\s+\[.*\]\(.*\)/.test(line)) {
        currentSection.linkCount++;
      } else {
        currentSection.nonLinkLines++;
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  const sectionCount = sections.length;
  const linkCount = sections.reduce((acc, s) => acc + s.linkCount, 0);
  const optionalIndex = sections.findIndex((s) => s.isOptional);
  const hasOptionalSection = optionalIndex !== -1;
  const optionalIsLast = hasOptionalSection && optionalIndex === sections.length - 1;

  return {
    title,
    sectionCount,
    linkCount,
    byteLength,
    wordCount,
    lineCount,
    sections,
    hasOptionalSection,
    optionalIsLast,
  };
}

type PreviewItem =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "p"; text: string }
  | { kind: "list"; items: Array<{ name: string; url: string | null; notes: string; raw: string }> };

function parseMarkdownPreview(content: string): PreviewItem[] {
  const items: PreviewItem[] = [];
  const lines = (content ?? "").replace(/^\uFEFF/, "").split(/\r?\n/);
  let pBuf: string[] = [];
  let qBuf: string[] = [];
  let lBuf: Array<{ name: string; url: string | null; notes: string; raw: string }> = [];

  const flushP = () => {
    if (pBuf.length) {
      items.push({ kind: "p", text: pBuf.join(" ") });
      pBuf = [];
    }
  };
  const flushQ = () => {
    if (qBuf.length) {
      items.push({ kind: "quote", text: qBuf.join(" ") });
      qBuf = [];
    }
  };
  const flushL = () => {
    if (lBuf.length) {
      items.push({ kind: "list", items: lBuf });
      lBuf = [];
    }
  };
  const flushAll = () => {
    flushP();
    flushQ();
    flushL();
  };

  const linkRegex = /^\s*[-*+]\s+\[([^\]]*)\]\(([^)\s]+)\)\s*(?::\s*(.*))?$/;
  const itemRegex = /^\s*[-*+]\s+(.*)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll();
      continue;
    }

    const hMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (hMatch) {
      flushAll();
      const text = hMatch[2].trim();
      items.push(hMatch[1].length === 1 ? { kind: "h1", text } : { kind: "h2", text });
      continue;
    }

    if (/^\s*>/.test(line)) {
      flushP();
      flushL();
      qBuf.push(line.replace(/^\s*>\s?/, "").trim());
      continue;
    }

    const lMatch = linkRegex.exec(trimmed);
    if (lMatch) {
      flushP();
      flushQ();
      lBuf.push({
        name: lMatch[1].trim(),
        url: lMatch[2].trim(),
        notes: (lMatch[3] || "").trim(),
        raw: trimmed,
      });
      continue;
    }

    const iMatch = itemRegex.exec(trimmed);
    if (iMatch) {
      flushP();
      flushQ();
      lBuf.push({
        name: iMatch[1].trim(),
        url: null,
        notes: "",
        raw: trimmed,
      });
      continue;
    }

    flushQ();
    flushL();
    pBuf.push(trimmed);
  }

  flushAll();
  return items;
}

const CORE_SPEC_RULES = [
  {
    id: "h1-title",
    title: "H1 project title",
    specText: "An H1 with the name of the project or site. This is the only required section.",
    weight: 25,
  },
  {
    id: "blockquote-summary",
    title: "Blockquote summary",
    specText: "A blockquote with a short summary of the project, containing key information necessary for understanding the rest of the file.",
    weight: 20,
  },
  {
    id: "project-details",
    title: "Detail blocks without headings",
    specText: "Zero or more markdown sections (for example paragraphs, lists, tables) of any type except headings, containing more detailed information.",
    weight: 15,
  },
  {
    id: "file-lists",
    title: "H2 sections with file lists",
    specText: "Zero or more markdown sections delimited by H2 headers, containing file lists of URLs where further detail is available.",
    weight: 25,
  },
  {
    id: "optional-section",
    title: "Optional section placement",
    specText: "A section named exactly Optional may be skipped when a shorter context is needed, so keep it last.",
    weight: 15,
  },
];

export default function LlmsTxtCheckerClient() {
  const [mode, setMode] = useState<Mode>("url");
  const [urlInput, setUrlInput] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [generatorUrl, setGeneratorUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results state
  const [urlResult, setUrlResult] = useState<UrlCheckResult | null>(null);
  const [validateResult, setValidateResult] = useState<LlmsTxtValidationResult | null>(null);
  const [generatorResult, setGeneratorResult] = useState<GeneratorResult | null>(null);

  // Active UI states
  const [activeResultsTab, setActiveResultsTab] = useState<"results" | "preview">("results");
  const [expandedRuleDetails, setExpandedRuleDetails] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"current" | "corrected">("current");

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = (content: string, filename = "llms.txt") => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Submit URL Check
  const runUrlCheck = async (target?: string) => {
    const toCheck = (target ?? urlInput).trim();
    if (!toCheck) {
      setErrorMessage("Please enter a website domain or published llms.txt URL.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setValidateResult(null);
    setGeneratorResult(null);

    try {
      const data = await checkLlmsTxtUrl(toCheck);
      setUrlResult(data);
      setActiveResultsTab("results");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to check published llms.txt URL.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Content Validation
  const runContentValidation = async () => {
    if (!pasteContent.trim()) {
      setErrorMessage("Please paste or type your llms.txt Markdown content.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setUrlResult(null);
    setGeneratorResult(null);

    try {
      const data = await validateLlmsTxtContent(pasteContent);
      setValidateResult(data);
      setActiveResultsTab("results");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to validate markdown content.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Generator
  const runGenerator = async (target?: string) => {
    const toGen = (target ?? generatorUrl).trim();
    if (!toGen) {
      setErrorMessage("Please enter a website URL to generate an llms.txt file.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setUrlResult(null);
    setValidateResult(null);

    try {
      const data = await generateLlmsTxt(toGen);
      setGeneratorResult(data);
      setPasteContent(data.draft);
      setActiveResultsTab("results");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate llms.txt draft.");
    } finally {
      setIsLoading(false);
    }
  };

  // Active validation dataset
  const activeValidation: LlmsTxtValidationResult | null =
    urlResult?.validation ?? validateResult ?? generatorResult?.validation ?? null;

  const currentMarkdown: string =
    urlResult?.validation.markdown ||
    validateResult?.markdown ||
    generatorResult?.draft ||
    "";

  const correctedMarkdown: string | undefined =
    urlResult?.validation.correctedMarkdown ||
    validateResult?.correctedMarkdown ||
    generatorResult?.validation.correctedMarkdown;

  const stats = useMemo(() => computeMarkdownStats(currentMarkdown), [currentMarkdown]);
  const previewItems = useMemo(() => parseMarkdownPreview(currentMarkdown), [currentMarkdown]);

  const score = activeValidation?.summary.score ?? 0;
  const scoreTheme = useMemo(() => getScoreTheme(score), [score]);
  const circumference = 2 * Math.PI * 52;

  // Group findings by severity
  const groupedFindings = useMemo(() => {
    const errors: ValidationFinding[] = [];
    const warnings: ValidationFinding[] = [];
    const notes: ValidationFinding[] = [];

    (activeValidation?.checks ?? []).forEach((c) => {
      if (c.status === "fail") {
        errors.push(c);
      } else if (c.status === "warning") {
        warnings.push(c);
      } else if (c.status === "skipped" || c.severity === "info") {
        notes.push(c);
      }
    });

    return { errors, warnings, notes };
  }, [activeValidation]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Free llms.txt Validator &amp; Checker</span>
        </div>
        <h1 className="mt-6 font-headline text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          llms.txt Checker
        </h1>
        <p className="mt-4 text-base sm:text-lg font-medium text-muted-foreground">
          Validate any llms.txt file against the official <span className="font-semibold text-foreground">llmstxt.org</span> specification.
        </p>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Check the H1 title, blockquote summary, detail blocks and H2 file lists by URL or pasted content — free, no sign-up.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {["Free", "No sign-up", "Follows the llmstxt.org spec", "URL or pasted content"].map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[11px] font-medium bg-muted/60">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Input Form Card */}
      <div className="mx-auto mt-10 max-w-3xl">
        <Card className="border-border/80 bg-card shadow-xl backdrop-blur">
          <Tabs value={mode} onValueChange={(val) => { setMode(val as Mode); setErrorMessage(null); }}>
            <div className="border-b border-border/80 px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1">
                <TabsTrigger value="url" className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                  <Globe className="h-4 w-4" />
                  <span>Check URL</span>
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  <span>Paste Content</span>
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Draft</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Check by URL */}
            <TabsContent value="url" className="p-6 md:p-8 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Published llms.txt or Domain URL
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isLoading && runUrlCheck()}
                      placeholder="e.g. docs.example.com or https://example.com/llms.txt"
                      className="h-12 pl-11 text-base bg-background"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-12 w-full justify-center whitespace-nowrap shadow-lg shadow-primary/20 sm:w-44 font-semibold"
                    onClick={() => runUrlCheck()}
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
                      </>
                    ) : (
                      <>
                        Check URL <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  A bare domain works — we add <code className="rounded bg-muted px-1 py-0.5">https://</code> and look for{" "}
                  <code className="rounded bg-muted px-1 py-0.5">/llms.txt</code> and{" "}
                  <code className="rounded bg-muted px-1 py-0.5">/llms-full.txt</code> at the site root.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Try verified examples:</span>
                  {[
                    "docs.anthropic.com",
                    "mintlify.com",
                    "docs.stripe.com",
                    "llmstxt.org",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setUrlInput(example);
                        runUrlCheck(example);
                      }}
                      className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs transition-colors hover:border-primary hover:text-foreground"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Paste Content */}
            <TabsContent value="paste" className="p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  llms.txt Markdown Content
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPasteContent(CANONICAL_LLMS_TXT_TEMPLATE)}
                  className="h-7 text-xs"
                >
                  <FileCode className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  Load Spec Template
                </Button>
              </div>
              <Textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="# Project Name&#10;&#10;> Brief summary for LLMs.&#10;&#10;## Documentation&#10;- [Getting Started](https://example.com/docs): Introduction guide"
                className="min-h-[220px] font-mono text-xs leading-relaxed bg-background"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {pasteContent.split(/\r?\n/).length} lines • {pasteContent.length} characters
                </span>
                <Button
                  size="lg"
                  className="h-11 px-6 shadow-lg shadow-primary/20 font-semibold"
                  onClick={runContentValidation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating...
                    </>
                  ) : (
                    <>
                      Validate Markdown <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: Generate Draft */}
            <TabsContent value="generate" className="p-6 md:p-8 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Website Domain for Auto-Generation
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={generatorUrl}
                      onChange={(e) => setGeneratorUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isLoading && runGenerator()}
                      placeholder="e.g. anavyaailabs.com or yoursite.com"
                      className="h-12 pl-11 text-base bg-background"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-12 w-full justify-center whitespace-nowrap shadow-lg shadow-primary/20 sm:w-44 font-semibold"
                    onClick={() => runGenerator()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        Generate Draft <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  Our crawler scans your homepage and public XML sitemaps to discover primary navigation sections, clean titles, and output a valid starter file.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="border-t border-destructive/20 bg-destructive/10 px-6 py-3.5 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="mx-auto mt-12 max-w-md space-y-4 py-10 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Analyzing file structure...</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Fetching content and validating against the 5 specification clauses of llmstxt.org
            </p>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY SECTION */}
      <AnimatePresence mode="wait">
        {!isLoading && activeValidation && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-12 max-w-5xl space-y-6"
          >
            {/* Primary Results Tabs Bar */}
            <Tabs
              value={activeResultsTab}
              onValueChange={(val) => setActiveResultsTab(val as "results" | "preview")}
              className="space-y-6"
            >
              <div className="flex justify-start">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/60 p-1 rounded-xl">
                  <TabsTrigger
                    value="results"
                    className="text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Validation results
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Formatted preview
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB CONTENT 1: VALIDATION RESULTS */}
              <TabsContent value="results" className="space-y-6 mt-0">
                {/* 1. Hero Dual Card: Compliance Score + Result Summary */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column: Spec Compliance Score Card */}
                  <Card
                    className={cn(
                      "flex flex-col items-center justify-center border p-6 text-center shadow-sm",
                      scoreTheme.border,
                      scoreTheme.bg
                    )}
                  >
                    <span className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      SPEC COMPLIANCE SCORE
                    </span>

                    {/* Donut progress ring */}
                    <div className="relative h-32 w-32">
                      <svg
                        viewBox="0 0 120 120"
                        className="h-32 w-32 -rotate-90"
                        role="img"
                        aria-label={`Score ${score} out of 100`}
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          strokeWidth="10"
                          stroke="currentColor"
                          className="text-muted-foreground/20"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          strokeWidth="10"
                          strokeLinecap="round"
                          stroke="currentColor"
                          className={scoreTheme.ring}
                          strokeDasharray={circumference}
                          strokeDashoffset={
                            circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-3xl font-extrabold leading-none", scoreTheme.text)}>
                          {score}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1">/ 100</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="mt-4 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("border bg-transparent text-sm font-extrabold", scoreTheme.border, scoreTheme.text)}
                      >
                        Grade {scoreTheme.grade}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm font-semibold",
                          activeValidation.summary.valid
                            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                            : "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5"
                        )}
                      >
                        {activeValidation.summary.valid ? "Spec compliant" : "Not compliant"}
                      </Badge>
                    </div>
                  </Card>

                  {/* Right Column: Result summary Card */}
                  <Card className="border-border/80 bg-card shadow-sm lg:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-foreground">Result summary</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {urlResult
                          ? "Checked a live file against the five structural rules of the llmstxt.org specification."
                          : "Validated content against the five structural rules of the llmstxt.org specification."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metric Boxes: Passed, Warnings, Failed */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center text-emerald-600 dark:text-emerald-400">
                          <div className="text-2xl font-extrabold leading-none">
                            {activeValidation.summary.passed}
                          </div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-90">
                            PASSED
                          </div>
                        </div>
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-center text-amber-600 dark:text-amber-400">
                          <div className="text-2xl font-extrabold leading-none">
                            {activeValidation.summary.warnings}
                          </div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-90">
                            WARNINGS
                          </div>
                        </div>
                        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-center text-rose-600 dark:text-rose-400">
                          <div className="text-2xl font-extrabold leading-none">
                            {activeValidation.summary.errors}
                          </div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-90">
                            FAILED
                          </div>
                        </div>
                      </div>

                      <Separator className="border-border/60" />

                      {/* 6 Metadata Statistics */}
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-3">
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                            TITLE (H1)
                          </dt>
                          <dd className="mt-0.5 truncate font-semibold text-foreground" title={stats.title || "— none —"}>
                            {stats.title || "— none —"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                            SECTIONS
                          </dt>
                          <dd className="mt-0.5 font-semibold text-foreground">{stats.sectionCount}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                            LINKS
                          </dt>
                          <dd className="mt-0.5 font-semibold text-foreground">{stats.linkCount}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                            FILE SIZE
                          </dt>
                          <dd className="mt-0.5 font-semibold text-foreground">
                            {formatBytes(stats.byteLength)}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                            WORDS
                          </dt>
                          <dd className="mt-0.5 font-semibold text-foreground">{stats.wordCount}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                            LINES
                          </dt>
                          <dd className="mt-0.5 font-semibold text-foreground">{stats.lineCount}</dd>
                        </div>
                      </dl>

                      {/* URL Diagnostic Details */}
                      {urlResult && (
                        <>
                          <Separator className="border-border/60" />
                          <div className="space-y-1.5 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                                CHECKED
                              </span>
                              <a
                                href={urlResult.finalUrl}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="break-all font-mono text-primary underline underline-offset-4 hover:opacity-80"
                              >
                                {urlResult.finalUrl}
                              </a>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                              <span>
                                HTTP status:{" "}
                                <strong className="text-foreground">{urlResult.httpStatus}</strong>
                              </span>
                              {urlResult.contentType && (
                                <span>
                                  Content-Type:{" "}
                                  <strong className="font-mono text-foreground">
                                    {urlResult.contentType}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 2. Root File Discovery Card (URL Scans Only) */}
                {urlResult && (
                  <Card className="border-border/80 bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <FileSearch className="h-4 w-4 text-primary" />
                        Root file discovery
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Both files belong at the site root.{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                          llms-full.txt
                        </code>{" "}
                        is the optional companion holding the full text rather than a link index.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        {
                          key: "llms.txt",
                          entry: urlResult.discovery?.llmsTxt ?? {
                            found: urlResult.httpStatus === 200,
                            status: urlResult.httpStatus,
                            url: urlResult.finalUrl,
                          },
                        },
                        {
                          key: "llms-full.txt",
                          entry: urlResult.discovery?.llmsFullTxt ?? {
                            found: false,
                            status: 404,
                            url: urlResult.finalUrl.replace(/\/llms\.txt$/i, "") + "/llms-full.txt",
                          },
                        },
                      ].map(({ key, entry }) => (
                        <div
                          key={key}
                          className={cn(
                            "rounded-lg border p-3 transition-colors",
                            entry.found
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : "border-border/80 bg-muted/30"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {entry.found ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="font-mono text-xs font-bold text-foreground">/{key}</span>
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {entry.found ? "Found" : "Missing"}
                              {entry.status !== null ? ` · ${entry.status}` : ""}
                            </span>
                          </div>
                          {entry.url && (
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="mt-1.5 block break-all font-mono text-[11px] text-primary underline underline-offset-4 hover:opacity-80"
                            >
                              {entry.url}
                            </a>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 3. Specification Rules Card Section */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Specification rules
                  </h2>

                  {CORE_SPEC_RULES.map((rule) => {
                    const matchCheck = activeValidation.checks.find(
                      (c) =>
                        c.id === rule.id ||
                        c.id.includes(rule.id) ||
                        (rule.id === "project-details" && c.id === "markdown-format") ||
                        (rule.id === "file-lists" && (c.id === "file-lists" || c.id === "h2-sections"))
                    );

                    const status = matchCheck?.status ?? "pass";
                    const isPass = status === "pass";
                    const isWarn = status === "warning";
                    const isFail = status === "fail";

                    const statusLabel = isPass ? "Pass" : isWarn ? "Warning" : "Fail";
                    const statusText = isPass
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isWarn
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400";
                    const statusRing = isPass
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : isWarn
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-rose-500/30 bg-rose-500/5";

                    const isExpanded = !!expandedRuleDetails[rule.id];
                    const details = matchCheck?.explanation ? [matchCheck.explanation] : [];

                    return (
                      <Card key={rule.id} className={cn("border shadow-sm", statusRing)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {isPass && <CheckCircle2 className={cn("h-5 w-5", statusText)} />}
                              {isWarn && <AlertTriangle className={cn("h-5 w-5", statusText)} />}
                              {isFail && <XCircle className={cn("h-5 w-5", statusText)} />}
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-foreground">{rule.title}</h3>
                                <Badge
                                  variant="outline"
                                  className={cn("text-[10px] font-bold uppercase", statusText)}
                                >
                                  {statusLabel}
                                </Badge>
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  weight {rule.weight}
                                </span>
                                <code className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                                  {rule.id}
                                </code>
                              </div>

                              <blockquote className="border-l-2 border-primary/40 pl-3 text-xs italic leading-relaxed text-muted-foreground">
                                {rule.specText}
                              </blockquote>

                              <p className="text-xs leading-relaxed text-foreground">
                                {matchCheck?.message ??
                                  (isPass
                                    ? `Section satisfies the specification clause (${rule.id}).`
                                    : "Rule evaluated.")}
                              </p>

                              {details.length > 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedRuleDetails((prev) => ({
                                        ...prev,
                                        [rule.id]: !prev[rule.id],
                                      }))
                                    }
                                    aria-expanded={isExpanded}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                                  >
                                    <ChevronDown
                                      className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
                                    />
                                    {isExpanded ? "Hide" : "Show"} context &amp; details
                                  </button>

                                  {isExpanded && (
                                    <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
                                      {details[0]}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* 4. Findings and Fixes Card (When issues exist) */}
                {(groupedFindings.errors.length > 0 ||
                  groupedFindings.warnings.length > 0 ||
                  groupedFindings.notes.length > 0) && (
                  <Card className="border-border/80 bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        Findings and fixes
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Every issue we detected, with the line number and the suggested change to make.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {[
                        {
                          key: "errors",
                          label: "Errors",
                          items: groupedFindings.errors,
                          text: "text-rose-600 dark:text-rose-400",
                          chip: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                          icon: XCircle,
                        },
                        {
                          key: "warnings",
                          label: "Warnings",
                          items: groupedFindings.warnings,
                          text: "text-amber-600 dark:text-amber-400",
                          chip: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                          icon: AlertTriangle,
                        },
                        {
                          key: "notes",
                          label: "Notes",
                          items: groupedFindings.notes,
                          text: "text-sky-600 dark:text-sky-400",
                          chip: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
                          icon: Info,
                        },
                      ].map(({ key, label, items, text, chip, icon: IconComponent }) => {
                        if (!items.length) return null;
                        return (
                          <div key={key} className="space-y-2">
                            <h3 className={cn("flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider", text)}>
                              <IconComponent className="h-3.5 w-3.5" />
                              {label} ({items.length})
                            </h3>
                            <ul className="space-y-2">
                              {items.map((item, idx) => (
                                <li
                                  key={`${key}-${idx}`}
                                  className="rounded-lg border border-border/80 bg-muted/30 p-3"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    {item.line && (
                                      <Badge variant="outline" className={cn("font-mono text-[10px]", chip)}>
                                        Line {item.line}
                                      </Badge>
                                    )}
                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                      {item.id}
                                    </code>
                                    <span className="text-xs font-semibold text-foreground">
                                      {item.name}
                                    </span>
                                  </div>
                                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-foreground">
                                    {item.message}
                                  </p>
                                  {item.suggestedCorrection && (
                                    <div className="mt-2 rounded border border-border/60 bg-background/90 p-2.5">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                                        <span className="flex items-center gap-1">
                                          <Sparkles className="h-3 w-3 text-primary" /> Fix:
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(item.suggestedCorrection!, `finding-${item.id}-${idx}`)}
                                          className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                                        >
                                          {copiedKey === `finding-${item.id}-${idx}` ? (
                                            <>
                                              <Check className="h-3 w-3 text-emerald-500" /> Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-3 w-3" /> Copy
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="mt-1 overflow-x-auto font-mono text-[11px] text-foreground/90">
                                        <code>{item.suggestedCorrection}</code>
                                      </pre>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* 5. Section Breakdown Card */}
                {stats.sections.length > 0 && (
                  <Card className="border-border/80 bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Link2 className="h-4 w-4 text-primary" />
                        Section breakdown
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Each H2 section, how many link-list items it holds, and how many lines inside it are not links.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Section (H2)</TableHead>
                              <TableHead className="text-right text-xs">Links</TableHead>
                              <TableHead className="text-right text-xs">Non-link lines</TableHead>
                              <TableHead className="text-right text-xs">Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.sections.map((section, idx) => (
                              <TableRow key={`${section.title}-${idx}`}>
                                <TableCell className="max-w-[280px] truncate text-xs font-medium text-foreground">
                                  {section.title}
                                </TableCell>
                                <TableCell className="text-right text-xs font-semibold">
                                  {section.linkCount}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right text-xs font-medium",
                                    section.nonLinkLines > 0
                                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {section.nonLinkLines}
                                </TableCell>
                                <TableCell className="text-right">
                                  {section.isOptional ? (
                                    <Badge
                                      variant="outline"
                                      className="border-sky-500/30 text-[10px] text-sky-600 dark:text-sky-400"
                                    >
                                      Optional
                                    </Badge>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">Standard</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {stats.hasOptionalSection && !stats.optionalIsLast && (
                        <p className="border-t border-border p-3 text-xs text-amber-600 dark:text-amber-400">
                          The <strong>Optional</strong> section is not the last section in the file. Because its URLs may be skipped for a shorter context, it should come last.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 6. Link Verification Report (URL Checker Only) */}
                {urlResult && urlResult.linkChecks && urlResult.linkChecks.links.length > 0 && (
                  <Card className="border-border/80 bg-card shadow-sm">
                    <CardHeader className="border-b border-border/80 pb-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <Link2 className="h-4 w-4 text-primary" />
                            Outbound link availability check
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            Automated HTTP ping verification of links discovered in this llms.txt file.
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <Badge variant="outline" className="text-[10px] bg-muted/40">
                            Total: {urlResult.linkChecks.summary.total}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                          >
                            OK: {urlResult.linkChecks.summary.ok}
                          </Badge>
                          {urlResult.linkChecks.summary.broken > 0 && (
                            <Badge
                              variant="destructive"
                              className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]"
                            >
                              Broken: {urlResult.linkChecks.summary.broken}
                            </Badge>
                          )}
                          {urlResult.linkChecks.summary.redirected > 0 && (
                            <Badge
                              variant="outline"
                              className="border-sky-500/30 bg-sky-500/10 text-sky-600 text-[10px]"
                            >
                              Redirected: {urlResult.linkChecks.summary.redirected}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="divide-y divide-border/60 max-h-[340px] overflow-y-auto pr-1">
                        {urlResult.linkChecks.links.map((link, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-foreground truncate">
                                  {link.title}
                                </span>
                                {link.section && (
                                  <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                                    {link.section}
                                  </span>
                                )}
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="text-muted-foreground hover:text-primary truncate mt-0.5 flex items-center gap-1 font-mono text-[11px]"
                              >
                                <span className="truncate">{link.url}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                            <div className="shrink-0 text-right">
                              {link.status === "ok" && (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                                >
                                  HTTP {link.httpStatus || 200} OK
                                </Badge>
                              )}
                              {link.status === "broken" && (
                                <Badge
                                  variant="destructive"
                                  className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]"
                                >
                                  Broken {link.httpStatus ? `(${link.httpStatus})` : ""}
                                </Badge>
                              )}
                              {link.status === "redirect" && (
                                <Badge
                                  variant="outline"
                                  className="border-sky-500/30 bg-sky-500/10 text-sky-600 text-[10px]"
                                >
                                  Redirect
                                </Badge>
                              )}
                              {link.isDuplicate && (
                                <span className="ml-1 text-[10px] text-amber-500">(dup)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* TAB CONTENT 2: FORMATTED PREVIEW & RAW */}
              <TabsContent value="preview" className="space-y-6 mt-0">
                {/* 1. Formatted Parsed Preview Card */}
                <Card className="border-border/80 bg-card shadow-sm">
                  <CardHeader className="flex flex-col gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <FileCode className="h-4 w-4 text-primary" />
                        Formatted preview
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Your file rendered as an AI crawler would read it: title, summary, detail blocks and link lists.
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(currentMarkdown, "preview-copy")}
                        className="h-8 text-xs font-semibold"
                      >
                        {copiedKey === "preview-copy" ? (
                          <>
                            <Check className="mr-1 h-3.5 w-3.5 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(currentMarkdown)}
                        className="h-8 text-xs font-semibold"
                      >
                        <Download className="mr-1 h-3.5 w-3.5" /> Download llms.txt
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {previewItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        The file is empty.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {previewItems.map((item, idx) => {
                          if (item.kind === "h1") {
                            return (
                              <h2
                                key={idx}
                                className="border-b border-border pb-2 text-2xl font-extrabold tracking-tight text-foreground"
                              >
                                {item.text}
                              </h2>
                            );
                          }
                          if (item.kind === "h2") {
                            return (
                              <h3
                                key={idx}
                                className="pt-2 text-lg font-bold tracking-tight text-foreground"
                              >
                                {item.text}
                              </h3>
                            );
                          }
                          if (item.kind === "quote") {
                            return (
                              <blockquote
                                key={idx}
                                className="flex gap-2 rounded-r-lg border-l-4 border-primary/50 bg-primary/5 py-2.5 pl-3 pr-3 text-sm italic leading-relaxed text-muted-foreground"
                              >
                                <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>{item.text}</span>
                              </blockquote>
                            );
                          }
                          if (item.kind === "p") {
                            return (
                              <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                                {item.text}
                              </p>
                            );
                          }
                          return (
                            <ul key={idx} className="space-y-1.5">
                              {item.items.map((sub, sIdx) => (
                                <li key={sIdx} className="flex gap-2 text-sm leading-relaxed">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                  <span className="min-w-0">
                                    {sub.url ? (
                                      <a
                                        href={sub.url}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="break-words font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                                      >
                                        {sub.name || sub.url}
                                      </a>
                                    ) : (
                                      <span className="break-words font-semibold text-foreground">
                                        {sub.name}
                                      </span>
                                    )}
                                    {sub.notes && (
                                      <span className="text-muted-foreground">: {sub.notes}</span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Raw File Viewer Card */}
                <Card className="border-border/80 bg-card shadow-sm">
                  <CardHeader className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">Raw file</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        The exact bytes we validated{urlResult ? " from your site" : ""}.
                      </CardDescription>
                    </div>

                    {correctedMarkdown && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={activeCodeTab === "current" ? "secondary" : "ghost"}
                          onClick={() => setActiveCodeTab("current")}
                          className="h-7 text-xs font-semibold"
                        >
                          Original
                        </Button>
                        <Button
                          size="sm"
                          variant={activeCodeTab === "corrected" ? "default" : "ghost"}
                          onClick={() => setActiveCodeTab("corrected")}
                          className="h-7 text-xs font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" /> Auto-Corrected
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
                      <code>
                        {activeCodeTab === "corrected" && correctedMarkdown
                          ? correctedMarkdown
                          : currentMarkdown || "[empty file]"}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDUCATIONAL & SEO CONTENT SECTIONS */}
      <div className="mx-auto mt-20 max-w-4xl space-y-16">
        <Separator className="border-border/60" />

        {/* What is llms.txt */}
        <section className="space-y-4">
          <Badge variant="outline" className="text-xs font-semibold text-primary">
            Format Specification
          </Badge>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            What is llms.txt?
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            The <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-semibold">llms.txt</code> file is a standardized Markdown document proposed by Jeremy Howard and Answer.AI to serve as a curated index for Large Language Models and AI search engines.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Just as <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-semibold">robots.txt</code> governs crawler permissions, <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-semibold">llms.txt</code> directs AI agents (such as ChatGPT, Claude, Perplexity, and Gemini) directly to your most relevant, high-information pages without parsing complex HTML navbars or scripts.
          </p>
        </section>

        {/* Specification Rules Grid */}
        <section className="space-y-6">
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">
              The 5 Validation Rules We Check
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Every check maps directly to a clause in the official llmstxt.org specification.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SPEC_RULES.map((rule) => (
              <Card key={rule.id} className="border-border/60 bg-card/60 p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    {rule.number}
                  </span>
                  <span>{rule.title}</span>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                  {rule.description}
                </p>
                <div className="mt-3 rounded bg-muted/40 p-2 text-[11px] text-foreground/80">
                  <strong>Tip:</strong> {rule.tip}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Canonical Spec Template */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">
                Canonical Spec Template
              </h2>
              <p className="text-xs text-muted-foreground">
                Copy this starter template, fill in your details, and place it at <code className="text-foreground">/llms.txt</code>.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(CANONICAL_LLMS_TXT_TEMPLATE, "canonical-template")}
              className="h-8 text-xs font-semibold"
            >
              {copiedKey === "canonical-template" ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Template
                </>
              )}
            </Button>
          </div>
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 font-mono text-xs text-foreground/90 overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">
              <code>{CANONICAL_LLMS_TXT_TEMPLATE}</code>
            </pre>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {LLMS_TXT_FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border/80 bg-card p-5">
                <h3 className="font-semibold text-base text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
