import { env } from "@/env";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export type ApiFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
  skipAuthInterceptor?: boolean;
  parseJson?: boolean;
};

function resolveApiPrefix(): string {
  const origin = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (origin) {
    return `${origin}/api/v1`;
  }
  return env.apiBaseUrl;
}

export const API_PREFIX = resolveApiPrefix();

export function buildApiUrl(path: string) {
  if (!API_PREFIX) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  return `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null;
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(buildApiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  } finally {
    refreshPromise = null;
  }
}

function parseEnvelope(rawBody: string): {
  success?: boolean;
  message?: string;
  code?: string;
  parsed: unknown;
} {
  if (!rawBody) {
    return { parsed: null };
  }
  try {
    const parsed = JSON.parse(rawBody) as {
      success?: boolean;
      message?: string;
      error?: string;
      code?: string;
    };
    return {
      success: parsed.success,
      message: parsed.message ?? parsed.error,
      code: parsed.code,
      parsed,
    };
  } catch {
    return { parsed: rawBody };
  }
}

function throwIfFailed(
  response: Response,
  envelope: ReturnType<typeof parseEnvelope>,
  rawBody: string
): void {
  const failedByFlag = envelope.success === false;
  if (response.ok && !failedByFlag) return;

  throw new ApiError(
    response.ok ? 400 : response.status,
    envelope.message || rawBody || "Request failed.",
    envelope.code
  );
}

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const hasBody = Boolean(init?.body);
  const headers = new Headers(init?.headers ?? {});

  if (hasBody && !headers.has("content-type") && !(init?.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const token = readAccessToken();
  if (token && !headers.has("authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    method,
    headers,
  });

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !init?.skipAuthInterceptor
  ) {
    if (!refreshPromise) {
      refreshPromise = performRefresh();
    }
    const newToken = await refreshPromise;

    if (newToken) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      return apiFetch<T>(path, {
        ...init,
        headers: retryHeaders,
        skipAuthInterceptor: true,
      });
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/login";
    }
  }

  if (init?.parseJson === false) {
    if (!response.ok) {
      const rawBody = await response.text();
      const envelope = parseEnvelope(rawBody);
      throwIfFailed(response, envelope, rawBody);
    }
    return response as unknown as T;
  }

  const rawBody = await response.text();
  const envelope = parseEnvelope(rawBody);
  throwIfFailed(response, envelope, rawBody);

  return envelope.parsed as T;
}

export async function apiFetchBlob(
  path: string,
  init?: ApiFetchInit
): Promise<Blob> {
  const response = await apiFetch<Response>(path, {
    ...init,
    parseJson: false,
  });
  return response.blob();
}
