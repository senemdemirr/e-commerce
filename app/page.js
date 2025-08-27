import dataFromApi from "@/lib/data/data.json";
import { flattenProducts } from "@/utils/flattenProducts";
import ProductList from "./components/ProductList";
export default function Home() {
  const products = flattenProducts(dataFromApi);
  return (
    <>
     <ProductList products={products}></ProductList>
    </>
  );
}
