export const API_PREFIX =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export function buildApiUrl(path: string) {
  if (!API_PREFIX) {
    console.warn(" API base URL not set. Falling back to relative path.");
    return path;
  }

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

  const url = buildApiUrl(path);

  console.log(" API CALL:", method, url);

  const response = await fetch(url, {
    ...init,
    method,
    headers,
  });

  const rawBody = await response.text();

  const parseJson = () => {
    if (!rawBody) return null;
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  };

  if (!response.ok) {
    const parsed = parseJson() as { error?: string; message?: string } | null;

    const message =
      parsed?.error ?? parsed?.message ?? rawBody ?? "Request failed.";

    console.error(" API ERROR:", message);
    throw new Error(message);
  }

  const parsed = parseJson();
  if (parsed !== null) {
    return parsed as T;
  }

  return rawBody as T;
}