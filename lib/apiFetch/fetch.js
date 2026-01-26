const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
        cache: "no-store",
        ...options,
    });
    if (!res.ok) {
        // Return null or throw based on your preference, 
        // but 201/204 are successful too.
        console.error(`API Fetch failed: ${res.status} ${res.statusText}`);
        return null;
    }
    if (res.status === 204) return {};
    return res.json();
}
