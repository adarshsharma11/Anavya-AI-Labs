import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

const pricingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  compareAtPrice: z.number().nullable(),
  discountPercent: z.number().nullable(),
  cadence: z.string(),
  type: z.enum(["free", "one_time", "subscription"]),
  features: z.array(z.string()),
  cta: z.string(),
  scanLimit: z.number(),
  badge: z.string().nullable(),
  isHighlighted: z.boolean(),
  active: z.boolean(),
  createdAt: z.string(),
  hasDiscount: z.boolean(),
});

const pricingResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(pricingPlanSchema),
});

export type PricingPlan = z.infer<typeof pricingPlanSchema>;

export async function fetchPricingPlans(options?: {
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
  };
}): Promise<PricingPlan[]> {
  const data = await apiFetch<unknown>("/pricing", {
    method: "GET",
    signal: options?.signal,
    cache: options?.cache,
    next: options?.next,
  });

  const parsed = pricingResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid pricing response.");
  }

  return parsed.data.data;
}
