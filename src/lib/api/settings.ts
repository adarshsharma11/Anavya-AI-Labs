import { env } from "@/env";
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
    companyName: env.siteCompanyName || DEFAULT_SITE_SETTINGS.companyName,
    domain: env.siteDomain || DEFAULT_SITE_SETTINGS.domain,
    effectiveDate: env.siteEffectiveDate || DEFAULT_SITE_SETTINGS.effectiveDate,
    email: env.siteEmail || DEFAULT_SITE_SETTINGS.email,
  };

  const enableRemote = env.enableSiteSettingsApi;
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
