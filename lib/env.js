
export function readBooleanEnv(name, fallback = false) {
  const value = process.env[name];

  if (typeof value === "undefined") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "true") return true;

  if (normalized === "false") return false;

  return fallback;
}

export function getAppBaseUrl() {
  const baseUrl = process.env.APP_BASE_URL || (process.env.VERCEL_URL ?? `https://${process.env.VERCEL_URL}`);
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}