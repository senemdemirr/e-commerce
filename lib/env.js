
export function readBooleanEnv(name) {
  const value = process.env[name];

  return value.toLowerCase() === "true";
}

export function getAppBaseUrl() {
  const baseUrl = process.env.APP_BASE_URL || (process.env.VERCEL_URL ?? `https://${process.env.VERCEL_URL}`);
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}