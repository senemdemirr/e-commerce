import ProductList from "@/components/ProductList";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { getOrCreateUserFromSession } from "@/lib/users";
import { Suspense } from "react";

async function fetchFavorite(userId) {
    const searchParams = new URLSearchParams();
    if (userId) searchParams.set("userId", userId);

    return await apiFetch(`/api/favorites?${searchParams.toString()}`);
}
export default async function FavoritesPage() {
    const user = await getOrCreateUserFromSession();
    const products = await fetchFavorite(user.id);
    return (
        <Suspense fallback={null}>
            <ProductList products={products} isFavorite={true}></ProductList>
        </Suspense>
    );
}