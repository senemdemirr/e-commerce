import { flattenProducts } from "@/utils/flattenProducts";
import dataFromApi from "@/lib/data/data.json";
import ProductList from "../components/ProductList";
export default function FavoritesPage(){
    const products = flattenProducts(dataFromApi);
    return (
        <ProductList products={products} isFavorite={true}></ProductList>
    );
}