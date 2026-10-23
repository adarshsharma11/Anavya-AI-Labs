import { apiFetch, apiFetchBlob } from "@/lib/api/client";
import type {
  ApiEnvelope,
  DashboardAnalytics,
  DashboardScan,
  Monitor,
  MonitorHistory,
  UserProfile,
} from "@/types/api";

function unwrap<T>(payload: ApiEnvelope<T> | T, key?: string): T {
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T> & Record<string, unknown>;
    if (envelope.data !== undefined) return envelope.data as T;
    if (key && envelope[key] !== undefined) return envelope[key] as T;
  }
  return payload as T;
}

export async function getProfileApi(): Promise<ApiEnvelope<UserProfile> & { profile?: UserProfile }> {
  const data = await apiFetch<ApiEnvelope<UserProfile> & { profile?: UserProfile }>(
    "/dashboard/me"
  );
  return {
    ...data,
    profile: data.profile ?? data.data,
    data: data.data ?? data.profile,
  };
}

export async function updateProfileApi(body: {
  readonly name?: string;
  readonly phoneNumber?: string;
  readonly companyName?: string;
  readonly companyLogoUrl?: string;
}) {
  return apiFetch<ApiEnvelope<UserProfile>>("/dashboard/me", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function getScansApi(): Promise<{
  readonly success: boolean;
  readonly scans: readonly DashboardScan[];
}> {
  const data = await apiFetch<
    ApiEnvelope<readonly DashboardScan[]> & { scans?: readonly DashboardScan[] }
  >("/dashboard/scans");
  return {
    success: data.success,
    scans: data.data ?? data.scans ?? [],
  };
}

export async function getAnalyticsApi(): Promise<{
  readonly success: boolean;
  readonly analytics: DashboardAnalytics;
}> {
  const data = await apiFetch<
    ApiEnvelope<DashboardAnalytics> & { analytics?: DashboardAnalytics }
  >("/dashboard/analytics");
  return {
    success: data.success,
    analytics: data.data ?? data.analytics ?? {
      totalScans: 0,
      avgPerformanceScore: 0,
      avgSeoScore: 0,
      totalIssuesFound: 0,
    },
  };
}

export async function getMonitorsApi(): Promise<readonly Monitor[]> {
  const data = await apiFetch<ApiEnvelope<readonly Monitor[]>>(
    "/dashboard/monitors"
  );
  return unwrap(data);
}

export async function createMonitorApi(url: string): Promise<Monitor> {
  const data = await apiFetch<ApiEnvelope<Monitor>>("/dashboard/monitors", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return unwrap(data);
}

export async function deleteMonitorApi(id: number): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(`/dashboard/monitors/${id}`, {
    method: "DELETE",
  });
}

export async function getMonitorHistoryApi(id: number): Promise<MonitorHistory> {
  const data = await apiFetch<ApiEnvelope<MonitorHistory>>(
    `/dashboard/monitors/${id}/history`
  );
  return unwrap(data);
}

export async function downloadPdfApi(publicId: string | number) {
  return apiFetchBlob(`/scan/${publicId}/pdf`);
}
