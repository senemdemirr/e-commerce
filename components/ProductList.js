"use client";
import ProductCard from "./ProductCard";
import { useSearchParams} from "next/navigation";
import { useMemo, useState } from "react";

export default function ProductList({ products, isFavoritePage = false}) {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const queryValue = query.trim().toLocaleLowerCase('tr');
    const [productList, setProductList] = useState(products);
    // 'tr' locale is used for Turkish characters like 'i' and 'I'

    function handleDeleteFavorite(product_id) {
        setProductList((item) => item.filter((p) => p.id !== product_id));
    }

    // I used useMemo for unnecessary renders to obstruct and for performance optimization
    const filtered = useMemo(() => {
        let list = productList;
        if (queryValue) {
            list = list.filter((product) => product.title.toLocaleLowerCase('tr').includes(queryValue))
        }
        return list;
    }, [productList, queryValue]);

    // Rerun the filter only if the values ​​in this list change, otherwise use the old result.
    if (filtered?.length === 0) {
        return <div className="py-8 text-center text-gray-500">No products found</div>
    }

    return (
        <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered?.map((product) => (
                    <ProductCard key={product.id} product={product} onDeleteFavorite={isFavoritePage ? handleDeleteFavorite : undefined}></ProductCard>
                ))}
            </div>

        </div>
    );
}