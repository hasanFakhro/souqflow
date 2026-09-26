import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.DEV_ORIGIN
    ? [process.env.DEV_ORIGIN, "localhost"]
    : ["localhost"],
};

export default nextConfig;
