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
  skipAuthInterceptor?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(buildApiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch (error) {
    console.error(" [Auth] Token refresh failed:", error);
    return null;
  } finally {
    refreshPromise = null;
  }
}


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

  // Inject JWT from localStorage organically
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = buildApiUrl(path);

  console.log(" API CALL:", method, url);

  const response = await fetch(url, {
    ...init,
    method,
    headers,
  });

  // Handle 401 Unauthorized globally by attempting refresh
  if (response.status === 401 && typeof window !== "undefined" && !init?.skipAuthInterceptor) {
    console.warn(" [Auth] 401 Detected. Attempting refresh...");
    
    if (!refreshPromise) {
      refreshPromise = performRefresh();
    }

    const newToken = await refreshPromise;

    if (newToken) {
       console.log(" [Auth] Token refreshed successfully. Retrying request...");
       // Retry with new token
       const newHeaders = new Headers(headers);
       newHeaders.set("Authorization", `Bearer ${newToken}`);
       
       return apiFetch<T>(path, {
         ...init,
         headers: newHeaders,
       });
    } else {
      console.error(" [Auth] Session expired. Logging out.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Check if we should redirect to login
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          window.location.href = "/login";
      }
    }
  }

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