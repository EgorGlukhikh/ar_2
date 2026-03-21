import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@academy/auth",
    "@academy/billing-domain",
    "@academy/db",
    "@academy/shared",
    "@academy/video-domain",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
