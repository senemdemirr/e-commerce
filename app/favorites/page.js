import { flattenProducts } from "@/utils/flattenProducts";
import dataFromApi from "@/lib/data/data.json";
import ProductList from "../components/ProductList";
import { Suspense } from "react";
export default function FavoritesPage() {
    const products = flattenProducts(dataFromApi);
    return (
        <Suspense fallback={null}>
            <ProductList products={products} isFavorite={true}></ProductList>
        </Suspense>
    );
}