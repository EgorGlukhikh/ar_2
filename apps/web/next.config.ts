import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@academy/auth",
    "@academy/billing-domain",
    "@academy/db",
    "@academy/shared",
    "@academy/video-domain",
  ],
};

export default nextConfig;
