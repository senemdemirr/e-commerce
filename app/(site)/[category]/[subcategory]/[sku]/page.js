import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import ProductDetailClient from "./ProductDetailClient";

async function fetchProductBySku(sku) {
    return await apiFetch(`/api/products/${sku}`);
}

export default async function ProductDetailPage({ params }) {
    const { category, subcategory, sku } = await params;

    const product = await fetchProductBySku(sku);
    if (!product) {
        return notFound();
    }

    return (
        <ProductDetailClient product={product} />
    );
}