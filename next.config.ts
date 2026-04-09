import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

const nextConfig: NextConfig = {
  turbopack: {},
  /* config options here */
  experimental: {
    // Other experimental options can stay here
  },
  // allowedDevOrigins should be at the root for Next.js 16 to recognize it correctly
  allowedDevOrigins: ['192.168.1.2', 'localhost'],
} as any;

const finalConfig = withPWA(nextConfig);

export default finalConfig;
