import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const highlightSchema = z.object({
  value: z.string(),
  label: z.string(),
  detail: z.string(),
});

const principleSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const cultureSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const aboutPageSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string(),
  badges: z.array(z.string()),
  imageUrl: z.string(),
  imageHint: z.string().nullable().optional(),
  highlights: z.array(highlightSchema),
  principles: z.array(principleSchema),
  culture: z.array(cultureSchema),
  principlesTitle: z.string().optional(),
  principlesDescription: z.string().optional(),
  cultureTitle: z.string().optional(),
  cultureDescription: z.string().optional(),
});

const aboutResponseSchema = z.object({
  success: z.boolean(),
  data: aboutPageSchema,
});

export type AboutPageData = z.infer<typeof aboutPageSchema>;

export async function fetchAboutData(options?: {
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
}): Promise<AboutPageData> {
  const data = await apiFetch<unknown>("/about", {
    method: "GET",
    signal: options?.signal,
    cache: options?.cache,
    next: options?.next,
  });

  const parsed = aboutResponseSchema.safeParse(data);
  if (!parsed.success || !parsed.data.success) {
    throw new Error("Invalid about response.");
  }

  return parsed.data.data;
}
