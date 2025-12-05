import ProductList from "@/components/ProductList";
import React from "react";
import { apiFetch } from "@/lib/apiFetch/fetch";

async function fetchProductsByCategory(category) {
  const searchParams = new URLSearchParams();
  if (category) searchParams.set("category", category);

  return apiFetch(`/api/products?${searchParams.toString()}`);
}

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const products = await fetchProductsByCategory(category);

  return <ProductList products={products} />;
}
