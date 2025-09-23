import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "150mb",
    },
  },
  // You can add other config options here
};

export default nextConfig;
