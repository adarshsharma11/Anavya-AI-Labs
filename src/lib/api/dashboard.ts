import { apiFetch } from "./client";

export const getProfileApi = async () => {
  return await apiFetch<any>("/dashboard/me", {
    method: "GET",
  });
};

export const updateProfileApi = async (body: any) => {
  return await apiFetch<any>("/dashboard/me", {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const getScansApi = async () => {
  return await apiFetch<any>("/dashboard/scans", {
    method: "GET",
  });
};

export const getAnalyticsApi = async () => {
  return await apiFetch<any>("/dashboard/analytics", {
    method: "GET",
  });
};

export const downloadPdfApi = async (scanId: number) => {
  // Returns BLOB via standard fetch because apiFetch tries to parse JSON usually,
  // Let's rely on standard fetch here for binary data.
  const API_PREFIX = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_PREFIX}/scan/${scanId}/pdf`, { headers });
  if (!res.ok) throw new Error("Failed to download PDF");
  return await res.blob();
};
