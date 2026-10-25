import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "anavyaailabs.com";

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isHttps = (forwardedProto ?? request.nextUrl.protocol.replace(":", "")) === "https";
  const isOurHost = hostname === CANONICAL_HOST || hostname === `www.${CANONICAL_HOST}`;

  if (!isOurHost) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const needsCanonicalHost = hostname !== CANONICAL_HOST || !isHttps;
  const needsSlashTrim = pathname !== url.pathname;

  if (!needsCanonicalHost && !needsSlashTrim) {
    return NextResponse.next();
  }

  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  url.pathname = pathname;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
