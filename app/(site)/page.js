import ProductList from "@/components/ProductList";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { Suspense } from "react";

async function fetchProducts(){
  return await apiFetch(`/api/products`);
}

export default async function Home() {
  const products = await fetchProducts();
  return (
    <>
      <Suspense fallback={null}>
        <ProductList products={products}></ProductList>
      </Suspense>
    </>
  );
}
