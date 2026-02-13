// const baseUrl = process.env.APP_BASE_URL;
export async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${endpoint}`, {
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
