import { getAppBaseUrl } from "@/lib/env";

function isBrowser() {
  return typeof window !== "undefined";
}

export async function apiFetch(endpoint, options = {}) {
  const url = isBrowser()
    ? endpoint
    : `${getAppBaseUrl()}${endpoint}`;
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

    const error = new Error(data?.message || errorMessage);
    error.status = res.status;
    error.data = data;
    error.url = url;
    throw error;
  }

  return data;
}