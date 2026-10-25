import { apiFetch } from "@/lib/api/client";
import { normalizePlans } from "@/lib/pricing";
import type { Plan } from "@/types/pricing";

export async function fetchPricingPlans(): Promise<readonly Plan[]> {
  const payload = await apiFetch<unknown>("/pricing", {
    method: "GET",
    next: { revalidate: 300, tags: ["plans"] },
  });
  return normalizePlans(payload);
}
