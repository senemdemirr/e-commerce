import ProductList from "@/components/ProductList";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { Suspense } from "react";

async function fetchFavorite(userId) {
    const searchParams = new URLSearchParams();
    if (userId) searchParams.set("userId", userId);

    return await apiFetch(`/api/favorites?${searchParams.toString()}`);
}
export default async function FavoritesPage() {
    const products = await fetchFavorite(1);
    return (
        <Suspense fallback={null}>
            <ProductList products={products} isFavorite={true}></ProductList>
        </Suspense>
    );
}