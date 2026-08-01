import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // API routes require dynamic server-side rendering during dev
  // Only use static export for production builds
};

export default nextConfig;
