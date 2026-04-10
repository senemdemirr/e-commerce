function isBrowser() {
  return typeof window !== "undefined";
}

function getServerBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

function isTestEnvironment() {
  return process.env.NODE_ENV === "test";
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
    const errorMessage = `API Fetch failed: ${res.status} ${res.statusText}`;
    if (res.status !== 401) {
      console.error(errorMessage);
    }

    if (isTestEnvironment()) {
      return data;
    }

    const error = new Error(data?.message || errorMessage);
    error.status = res.status;
    error.data = data;
    error.url = url;
    throw error;
  }

  return data;
}
