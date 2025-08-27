import dataFromApi from "@/lib/data/data.json";
import { flattenProducts } from "@/utils/flattenProducts";
import ProductList from "../components/ProductList";

export default function CategoryPage({params}) {
  const {category} = params;
  const products = flattenProducts(dataFromApi);
  return <ProductList products={products} fixedCategorySlug={category}></ProductList>
}