import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["iyzipay"],

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    outputFileTracingRoot: path.join(process.cwd()),
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/iyzipay/**/*'],
    },
  },
};

export default nextConfig;
