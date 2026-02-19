export const API_PREFIX =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export function buildApiUrl(path: string) {
  if (!API_PREFIX) return path;
  return `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

export type ApiFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const hasBody = Boolean(init?.body);
  const headers = new Headers(init?.headers ?? {});

  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    method,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const data = (await response.json()) as { error?: string; message?: string };
      message = data.error ?? data.message ?? message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
