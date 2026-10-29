import { apiFetch } from "./client";
import type { ApiEnvelope } from "@/types/api";
import type {
  GeneratorResult,
  LlmsTxtValidationResult,
  UrlCheckResult,
} from "@/types/llms-txt";

/**
 * Validates a live published llms.txt URL, runs specification checks, and inspects links.
 */
export async function checkLlmsTxtUrl(
  url: string,
  options?: { signal?: AbortSignal }
): Promise<UrlCheckResult> {
  const envelope = await apiFetch<ApiEnvelope<UrlCheckResult>>(
    "/tools/llms-txt/check-url",
    {
      method: "POST",
      body: JSON.stringify({ url }),
      signal: options?.signal,
    }
  );
  if (!envelope.data) {
    throw new Error(envelope.message || "Failed to analyze published llms.txt URL.");
  }
  return envelope.data;
}

/**
 * Validates raw Markdown text in-memory against the official llmstxt.org specification.
 */
export async function validateLlmsTxtContent(
  content: string,
  options?: { signal?: AbortSignal }
): Promise<LlmsTxtValidationResult> {
  const envelope = await apiFetch<ApiEnvelope<LlmsTxtValidationResult>>(
    "/tools/llms-txt/validate",
    {
      method: "POST",
      body: JSON.stringify({ content }),
      signal: options?.signal,
    }
  );
  if (!envelope.data) {
    throw new Error(envelope.message || "Failed to validate llms.txt markdown content.");
  }
  return envelope.data;
}

/**
 * Discovers site metadata and sitemap URLs to build a compliant, draft llms.txt file deterministically.
 */
export async function generateLlmsTxt(
  websiteUrl: string,
  options?: { signal?: AbortSignal }
): Promise<GeneratorResult> {
  const envelope = await apiFetch<ApiEnvelope<GeneratorResult>>(
    "/tools/llms-txt/generate",
    {
      method: "POST",
      body: JSON.stringify({ websiteUrl }),
      signal: options?.signal,
    }
  );
  if (!envelope.data) {
    throw new Error(envelope.message || "Failed to generate llms.txt draft.");
  }
  return envelope.data;
}

