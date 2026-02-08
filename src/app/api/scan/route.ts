import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';
import type { ScanResponse, ScanResult, ScanCategory, ScanSeverity } from '@/lib/scan-types';

export const runtime = 'nodejs';

const MAX_HTML_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 12_000;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return true;
  }

  const [a, b] = parts;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fe80:')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  return false;
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Localhost URLs are not allowed.');
  }

  const ipType = net.isIP(hostname);
  if (ipType === 4) {
    if (isPrivateIpv4(hostname)) throw new Error('Private network URLs are not allowed.');
    return parsed;
  }
  if (ipType === 6) {
    if (isPrivateIpv6(hostname)) throw new Error('Private network URLs are not allowed.');
    return parsed;
  }

  const lookup = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!lookup.length) throw new Error('Unable to resolve hostname.');

  for (const address of lookup) {
    if (address.family === 4 && isPrivateIpv4(address.address)) {
      throw new Error('Private network URLs are not allowed.');
    }
    if (address.family === 6 && isPrivateIpv6(address.address)) {
      throw new Error('Private network URLs are not allowed.');
    }
  }

  return parsed;
}

async function readBodyWithLimit(response: Response): Promise<{ html: string; bytes: number }> {
  const body = response.body;
  if (!body) return { html: '', bytes: 0 };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    bytes += value.byteLength;
    if (bytes > MAX_HTML_BYTES) {
      throw new Error('Page is too large to scan.');
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { html: new TextDecoder('utf-8').decode(merged), bytes };
}

function findTagContent(html: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  if (!match) return null;
  const content = match[1]?.replace(/\s+/g, ' ').trim();
  return content ? content : null;
}

function decodeHtmlEntities(input: string): string {
  const named: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
  };

  let output = input;
  output = output.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
    const codePoint = Number.parseInt(hex, 16);
    if (!Number.isFinite(codePoint)) return _;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return _;
    }
  });
  output = output.replace(/&#(\d+);/g, (_, num: string) => {
    const codePoint = Number.parseInt(num, 10);
    if (!Number.isFinite(codePoint)) return _;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return _;
    }
  });
  output = output.replace(/&(nbsp|amp|quot|apos|rsquo|lsquo|rdquo|ldquo);|&#39;/g, (m) => {
    return named[m] ?? m;
  });

  return output;
}

function normalizedTextLength(input: string): number {
  const normalized = decodeHtmlEntities(input).replace(/\s+/g, ' ').trim();
  return Array.from(normalized).length;
}

function parseTagAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /([A-Za-z_:][A-Za-z0-9_:\-\.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(tag)) !== null) {
    const key = match[1]?.toLowerCase();
    if (!key) continue;
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[key] = value;
  }
  return attrs;
}

function findMetaContent(html: string, key: { name?: string; property?: string }): string | null {
  const attr = key.name ? 'name' : 'property';
  const target = (key.name ?? key.property)?.toLowerCase();
  if (!target) return null;

  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attrs = parseTagAttributes(tag);
    const marker = (attrs[attr] ?? '').toLowerCase();
    if (marker !== target) continue;
    const content = attrs['content']?.trim();
    if (content) return content;
  }

  return null;
}

function findLinkRelHref(html: string, rel: string): string | null {
  const relEscaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex1 = new RegExp(
    `<link[^>]*rel=["']${relEscaped}["'][^>]*href=["']([^"']*)["'][^>]*>`,
    'i'
  );
  const regex2 = new RegExp(
    `<link[^>]*href=["']([^"']*)["'][^>]*rel=["']${relEscaped}["'][^>]*>`,
    'i'
  );
  const match = html.match(regex1) ?? html.match(regex2);
  const href = match?.[1]?.trim();
  return href ? href : null;
}

function countImagesMissingAlt(html: string): number {
  const matches = html.match(/<img\b[^>]*>/gi) ?? [];
  let missing = 0;

  for (const tag of matches) {
    const hasAlt = /\salt\s*=\s*['"][^'"]*['"]/i.test(tag);
    if (!hasAlt) missing += 1;
  }

  return missing;
}

function countHeadings(html: string, heading: 'h1' | 'h2'): number {
  const regex = new RegExp(`<${heading}\\b[^>]*>`, 'gi');
  return (html.match(regex) ?? []).length;
}

function hasHtmlLang(html: string): boolean {
  return /<html\b[^>]*\blang\s*=\s*['"][^'"]+['"][^>]*>/i.test(html);
}

function addResult(
  results: ScanResult[],
  input: {
    type: ScanCategory;
    id: string;
    title: string;
    description: string;
    severity: ScanSeverity;
    isPremium?: boolean;
  }
) {
  results.push({
    id: input.id,
    type: input.type,
    title: input.title,
    description: input.description,
    severity: input.severity,
    isPremium: input.isPremium ?? false,
  });
}

function scoreFromResults(results: ScanResult[]) {
  const scores: Record<ScanCategory, number> = {
    Performance: 100,
    SEO: 100,
    Accessibility: 100,
  };

  const weights: Record<ScanSeverity, number> = {
    High: 25,
    Medium: 12,
    Low: 5,
  };

  for (const r of results) {
    if (r.isPremium) continue;
    scores[r.type] = Math.max(0, Math.min(100, scores[r.type] - weights[r.severity]));
  }

  const overallScore = Math.round(
    (scores.Performance + scores.SEO + scores.Accessibility) / 3
  );

  return { overallScore, scores };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const rawUrl = body?.url?.trim();
    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing url.' }, { status: 400 });
    }

    const parsedUrl = await assertSafeUrl(rawUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const start = Date.now();

    let response: Response;
    let html = '';
    let bytes = 0;

    try {
      response = await fetch(parsedUrl.toString(), {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'anavyaailabs-scanner/0.1 (+https://anavyaailabs.com)',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const body = await readBodyWithLimit(response);
      html = body.html;
      bytes = body.bytes;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('Scan timed out.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const responseTimeMs = Date.now() - start;

    const contentType = response.headers.get('content-type');
    const finalUrl = response.url || parsedUrl.toString();

    const results: ScanResult[] = [];

    if (responseTimeMs > 2000) {
      addResult(results, {
        id: 'perf-response-time',
        type: 'Performance',
        title: 'Reduce initial server response time',
        description: `Initial response time is ${responseTimeMs}ms. Aim for under 500ms for a faster first impression.`,
        severity: 'High',
      });
    } else if (responseTimeMs > 800) {
      addResult(results, {
        id: 'perf-response-time',
        type: 'Performance',
        title: 'Improve initial server response time',
        description: `Initial response time is ${responseTimeMs}ms. Aim for under 500ms where possible.`,
        severity: 'Medium',
      });
    }

    if (bytes > 500_000) {
      addResult(results, {
        id: 'perf-html-size',
        type: 'Performance',
        title: 'Reduce HTML document size',
        description: `The HTML payload is ${Math.round(bytes / 1024)}KB. Large documents can slow down parsing and rendering.`,
        severity: bytes > 900_000 ? 'High' : 'Medium',
      });
    }

    const cacheControl = response.headers.get('cache-control');
    if (!cacheControl) {
      addResult(results, {
        id: 'perf-cache-control',
        type: 'Performance',
        title: 'Add caching headers',
        description:
          'No Cache-Control header detected. Proper caching improves repeat visits and reduces server load.',
        severity: 'Low',
      });
    }

    const title = findTagContent(html, 'title');
    if (!title) {
      addResult(results, {
        id: 'seo-title',
        type: 'SEO',
        title: 'Add a page title',
        description: 'No <title> tag detected. Add a concise, descriptive title for better search visibility.',
        severity: 'High',
      });
    } else {
      const titleLength = normalizedTextLength(title);
      if (titleLength < 10 || titleLength > 70) {
      addResult(results, {
        id: 'seo-title-length',
        type: 'SEO',
        title: 'Optimize title length',
        description: `Your <title> length is ${titleLength} characters. Aim for 10–70 characters.`,
        severity: 'Low',
      });
    }
    }

    const metaDescription = findMetaContent(html, { name: 'description' });
    if (!metaDescription) {
      addResult(results, {
        id: 'seo-meta-description',
        type: 'SEO',
        title: 'Add a meta description',
        description:
          'Missing meta description. Add a clear summary to improve click-through rate from search results.',
        severity: 'High',
      });
    } else {
      const descriptionLength = normalizedTextLength(metaDescription);
      if (descriptionLength < 50 || descriptionLength > 170) {
      addResult(results, {
        id: 'seo-meta-description-length',
        type: 'SEO',
        title: 'Optimize meta description length',
        description: `Meta description is ${descriptionLength} characters. Aim for 50–170 characters.`,
        severity: 'Low',
      });
    }
    }

    const canonical = findLinkRelHref(html, 'canonical');
    if (!canonical) {
      addResult(results, {
        id: 'seo-canonical',
        type: 'SEO',
        title: 'Add a canonical URL',
        description:
          'No canonical link detected. Add <link rel="canonical"> to help prevent duplicate-content issues.',
        severity: 'Medium',
      });
    }

    const viewport = findMetaContent(html, { name: 'viewport' });
    if (!viewport) {
      addResult(results, {
        id: 'seo-viewport',
        type: 'SEO',
        title: 'Add a viewport meta tag',
        description:
          'Missing viewport meta tag. This can hurt mobile friendliness and SEO rankings.',
        severity: 'High',
      });
    }

    const ogTitle = findMetaContent(html, { property: 'og:title' });
    const ogDescription = findMetaContent(html, { property: 'og:description' });
    if (!ogTitle || !ogDescription) {
      addResult(results, {
        id: 'seo-open-graph',
        type: 'SEO',
        title: 'Add Open Graph tags',
        description:
          'Missing Open Graph tags (og:title and/or og:description). These improve link previews in social apps.',
        severity: 'Low',
      });
    }

    const h1Count = countHeadings(html, 'h1');
    if (h1Count === 0) {
      addResult(results, {
        id: 'seo-h1',
        type: 'SEO',
        title: 'Add an H1 heading',
        description:
          'No <h1> detected. Add a single, descriptive H1 to clarify the page topic for users and search engines.',
        severity: 'Medium',
      });
    } else if (h1Count > 1) {
      addResult(results, {
        id: 'seo-h1-multiple',
        type: 'SEO',
        title: 'Use a single H1 heading',
        description: `Detected ${h1Count} <h1> tags. Prefer a single H1 per page for clearer structure.`,
        severity: 'Low',
      });
    }

    const missingAltCount = countImagesMissingAlt(html);
    if (missingAltCount > 0) {
      addResult(results, {
        id: 'a11y-image-alt',
        type: 'Accessibility',
        title: 'Add missing image alt text',
        description: `Found ${missingAltCount} image(s) missing alt text, which can block screen reader users.`,
        severity: missingAltCount >= 5 ? 'High' : 'Medium',
      });
    }

    if (!hasHtmlLang(html)) {
      addResult(results, {
        id: 'a11y-html-lang',
        type: 'Accessibility',
        title: 'Declare the document language',
        description:
          'Missing <html lang="...">. Add the language to improve screen reader pronunciation and accessibility.',
        severity: 'Medium',
      });
    }

    const { overallScore, scores } = scoreFromResults(results);

    const payload: ScanResponse = {
      results,
      summary: {
        overallScore,
        scores,
        metrics: {
          scannedUrl: parsedUrl.toString(),
          finalUrl,
          status: response.status,
          responseTimeMs,
          contentType,
          contentBytes: bytes,
        },
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scan failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
