import dataFromApi from "@/lib/data/data.json";
import { flattenProducts } from "@/utils/flattenProducts";
import ProductList from "./components/ProductList";
import { Suspense } from "react";
export default function Home() {
  const products = flattenProducts(dataFromApi);
  return (
    <>
      <Suspense fallback={null}>
        <ProductList products={products}></ProductList>
      </Suspense>
    </>
  );
}
