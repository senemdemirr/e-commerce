const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
        cache: "no-store",
        ...options,
    });
    if (!res.ok) {
        console.error(`API Fetch failed: ${res.status} ${res.statusText}`);
        try {
            return await res.json();
        } catch (e) {
            return null;
        }
    }
    if (res.status === 204) return {};
    return res.json();
}
