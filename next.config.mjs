import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // You already added this (good)
  serverExternalPackages: ["iyzipay"],

  experimental: {
    outputFileTracingRoot: path.join(process.cwd()),

    // ✅ Force include the folder iyzipay reads at runtime
    outputFileTracingIncludes: {
      // App Router route handler key (common)
      "/api/checkout/route": ["./node_modules/iyzipay/lib/resources/**"],
      "/api/checkout": ["./node_modules/iyzipay/lib/resources/**"],
      // If your project uses pages router api route instead, use:
      // "pages/api/checkout": ["./node_modules/iyzipay/lib/resources/**"],
    },
  },
};

export default nextConfig;
