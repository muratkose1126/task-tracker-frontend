import type { NextConfig } from "next";

const envOrigin = process.env.NEXT_PUBLIC_DEV_ORIGIN;
const allowedDevOrigins = envOrigin
  ? [envOrigin]
  : ["localhost"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
