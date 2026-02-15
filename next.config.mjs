import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["iyzipay"], // Node/fs kullanan paketler için uygun :contentReference[oaicite:1]{index=1}

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    outputFileTracingRoot: path.join(process.cwd()),
    outputFileTracingIncludes: {
      "/api/**/*": ["./node_modules/iyzipay/**/*"],
    },
  },
};

export default nextConfig;
