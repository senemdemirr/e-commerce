import ProductList from "@/components/ProductList";
import React from "react";
import { apiFetch } from "@/lib/apiFetch/fetch";

async function fetchProductByCategories({ category, subcategory }) {
  const filters = { category, subcategory };

  const searchParams = new URLSearchParams(
    Object.entries(filters).filter(([_, value]) => value)
  );

  return apiFetch(`/api/products?${searchParams.toString()}`);
}

export default async function SubCategoryPage({ params }) {
  const { category, subcategory } = await params;
  // this value names are must same dynamic page name. if not pages isn't work because isn't finded params and route
  const products = await fetchProductByCategories({ category, subcategory });
  return <ProductList products={products}></ProductList>
}