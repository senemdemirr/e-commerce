import dataFromApi from "@/lib/data/data.json";
import { flattenProducts } from "@/utils/flattenProducts";
import ProductList from "../../components/ProductList";

export default function SubCategoryPage({params}) {
  const {category, subcategory} = params;
  // this value names are must same dynamic page name. if not pages isn't work because isn't finded params and route
  const products = flattenProducts(dataFromApi);
  return <ProductList products={products} fixedCategorySlug={category} fixedSubCategorySlug={subcategory}></ProductList>
}