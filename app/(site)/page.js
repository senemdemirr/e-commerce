import ProductList from "@/components/ProductList";
import CampaignSlider from "@/components/CampaignSlider";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { Suspense } from "react";

async function fetchProducts(){
  return await apiFetch(`/api/products`);
}

async function fetchCampaigns() {
  try {
    return await apiFetch(`/api/campaigns`);
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
    return [];
  }
}

export default async function Home() {
  const [products, campaigns] = await Promise.all([
    fetchProducts(),
    fetchCampaigns()
  ]);

  return (
    <>
      <CampaignSlider campaigns={campaigns} />
      <Suspense fallback={null}>
        <ProductList products={products}></ProductList>
      </Suspense>
    </>
  );
}
