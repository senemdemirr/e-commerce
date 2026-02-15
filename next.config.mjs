import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["iyzipay"],

  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/iyzipay/**/*"],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
