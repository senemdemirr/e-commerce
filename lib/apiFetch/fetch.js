function isBrowser() {
  return typeof window !== "undefined";
}

function getServerBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

export async function apiFetch(endpoint, options = {}) {
  const url = isBrowser()
    ? endpoint 
    : `${getServerBaseUrl()}${endpoint}`;

  const res = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  if (res.status === 204) return {};

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error(`API Fetch failed: ${res.status} ${res.statusText}`, { url, data });
    throw new Error(data?.message || `API Fetch failed: ${res.status} ${res.statusText}`);
  }

  return data;
}
