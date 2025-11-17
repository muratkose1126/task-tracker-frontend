import type { NextConfig } from "next";

const envOrigin = process.env.NEXT_PUBLIC_DEV_ORIGIN;
const allowedDevOrigins = envOrigin
  ? [envOrigin]
  : ["localhost"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
