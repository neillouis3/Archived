import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /** Avoid scanning the wrong tree when a lockfile exists in a parent folder (e.g. ~/package-lock.json). */
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "150mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
