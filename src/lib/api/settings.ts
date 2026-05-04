import { apiFetch } from "./client";

export interface SiteSettings {
  companyName: string;
  domain: string;
  effectiveDate: string;
  email: string;
  [key: string]: string;
}

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const res = await apiFetch<{ success: boolean; data: Record<string, string> }>("/settings", {
      method: "GET",
    });
    
    if (res.success && res.data) {
      return {
        companyName: res.data.companyName || "Anavya AI Labs",
        domain: res.data.domain || "anavyaailabs.com",
        effectiveDate: res.data.effectiveDate || "2026-05-01",
        email: res.data.email || "support@anavyaailabs.com",
        ...res.data,
      };
    }
  } catch (error) {
    console.error("Failed to fetch site settings", error);
  }
  
  // Default fallbacks
  return {
    companyName: "Anavya AI Labs",
    domain: "anavyaailabs.com",
    effectiveDate: "2026-05-01",
    email: "support@anavyaailabs.com",
  };
};
