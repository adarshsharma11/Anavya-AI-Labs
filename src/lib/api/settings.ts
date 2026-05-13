import { apiFetch } from "./client";

export interface SiteSettings {
  companyName: string;
  domain: string;
  effectiveDate: string;
  email: string;
  [key: string]: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: "Anavya AI Labs",
  domain: "anavyaailabs.com",
  effectiveDate: "2026-05-01",
  email: "support@anavyaailabs.com",
};

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const envSettings: SiteSettings = {
    companyName:
      (process.env.NEXT_PUBLIC_SITE_COMPANY_NAME ?? "").trim() ||
      DEFAULT_SITE_SETTINGS.companyName,
    domain:
      (process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "").trim() ||
      DEFAULT_SITE_SETTINGS.domain,
    effectiveDate:
      (process.env.NEXT_PUBLIC_SITE_EFFECTIVE_DATE ?? "").trim() ||
      DEFAULT_SITE_SETTINGS.effectiveDate,
    email:
      (process.env.NEXT_PUBLIC_SITE_EMAIL ?? "").trim() ||
      DEFAULT_SITE_SETTINGS.email,
  };

  const enableRemote = process.env.NEXT_PUBLIC_ENABLE_SITE_SETTINGS_API === "true";
  if (!enableRemote) {
    return envSettings;
  }

  try {
    const res = await apiFetch<{ success: boolean; data: Record<string, string> }>("/settings", {
      method: "GET",
    });
    
    if (res.success && res.data) {
      return {
        companyName: res.data.companyName || envSettings.companyName,
        domain: res.data.domain || envSettings.domain,
        effectiveDate: res.data.effectiveDate || envSettings.effectiveDate,
        email: res.data.email || envSettings.email,
        ...res.data,
      };
    }
  } catch (error) {
    return envSettings;
  }
  
  return envSettings;
};
