import type { NextConfig } from "next";

const envOrigin = process.env.NEXT_PUBLIC_DEV_ORIGIN;
const allowedDevOrigins = envOrigin ? [envOrigin] : ["localhost"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Suppress some development warnings
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
