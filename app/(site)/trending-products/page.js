import ProductList from "@/components/ProductList";
import { fetchHomepageProducts } from "@/lib/homepage-data";
import { pickHomepageProducts } from "@/lib/homepage-products";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TrendingProductsPage() {
  const products = await fetchHomepageProducts();
  const { trendingProducts } = pickHomepageProducts(products);

  return (
    <main className="min-h-screen bg-background-light py-8 dark:bg-background-dark">
      <Suspense fallback={null}>
        <ProductList products={trendingProducts} />
      </Suspense>
    </main>
  );
}
