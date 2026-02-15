import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["iyzipay"], // Node/fs kullanan paketler için uygun :contentReference[oaicite:1]{index=1}

  // ✅ BUNLAR experimental içinde değil, ROOT seviyede olmalı :contentReference[oaicite:2]{index=2}
  outputFileTracingRoot: path.join(process.cwd()),

  outputFileTracingIncludes: {
    // ✅ key: route path (URL), dosya yolu değil :contentReference[oaicite:3]{index=3}
    "/api/checkout": ["./node_modules/iyzipay/lib/**"],
    "/api/payment": ["./node_modules/iyzipay/lib/**"],
  },
};

export default nextConfig;
