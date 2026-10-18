import type {NextConfig} from 'next';

import { exposeVarToPublic } from './src/env';

const nextConfig: NextConfig = {
  env: exposeVarToPublic(),
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
