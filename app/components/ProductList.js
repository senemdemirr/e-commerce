import { flattenProducts } from "@/utils/flattenProducts.js";
import dataFromApi from "@/lib/data/data.json";
import ProductCard from "./ProductCard";

export default function ProductList() {
    const data = flattenProducts(dataFromApi);
    return(
        <div className="py-8">
            <div className="grid grid-cols-1 m:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((product) => (
                    <ProductCard key={product.id} product={product}></ProductCard>
                ))}
            </div>

        </div>
    );
}