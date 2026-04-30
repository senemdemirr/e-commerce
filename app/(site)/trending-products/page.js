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
      <section className="container mx-auto px-4 sm:px-0">
        <div className="rounded-3xl bg-white px-6 py-8 shadow-sm dark:bg-surface-dark sm:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Current Catalog
          </span>
          <h1 className="mt-2 text-3xl font-bold text-text-main dark:text-white sm:text-4xl">
            Trending Products
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
            Top products selected from the same trending collection shown on the homepage.
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <ProductList products={trendingProducts} />
      </Suspense>
    </main>
  );
}
