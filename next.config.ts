import type {NextConfig} from 'next';

import { exposeVarToPublic } from './src/env';

const CANONICAL_ORIGIN = "https://anavyaailabs.com";

const nextConfig: NextConfig = {
  env: exposeVarToPublic(),
  async rewrites() {
    return [{ source: "/sitemap", destination: "/sitemap.xml" }];
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "www.anavyaailabs.com" }],
        destination: `${CANONICAL_ORIGIN}/`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.anavyaailabs.com" }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
      {
        source: "/",
        has: [
          { type: "host", value: "anavyaailabs.com" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: `${CANONICAL_ORIGIN}/`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          { type: "host", value: "anavyaailabs.com" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
