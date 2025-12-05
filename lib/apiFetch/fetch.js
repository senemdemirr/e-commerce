const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
        cache: "no-store",
        ...options,
    });
    if (res.status != 200) {
        return null;
    }
    if (!res.ok) {
        throw new Error("API request failed");
    }
    return res.json();
}
