import type { Metadata } from "next";

import { toCanonicalUrl } from "@/config/site";

export function noindexMetadataFor(path: `/${string}`): Metadata {
  const canonicalUrl = toCanonicalUrl(path);

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      url: canonicalUrl,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}
