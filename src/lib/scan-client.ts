import type { ScanResponse } from '@/lib/scan-types';

export async function scanWebsite(
  url: string,
  options?: { signal?: AbortSignal }
): Promise<ScanResponse> {
  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ url }),
    signal: options?.signal,
  });

  if (!response.ok) {
    let message = 'Scan failed.';
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  return (await response.json()) as ScanResponse;
}

