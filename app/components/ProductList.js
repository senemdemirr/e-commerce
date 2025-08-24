"use client";
import { flattenProducts } from "@/utils/flattenProducts.js";
import dataFromApi from "@/lib/data/data.json";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ProductList() {
    const data = useMemo(() => flattenProducts(dataFromApi) , []);
    // I used useMemo for unnecessary renders to obstruct and for performance optimization
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const queryValue = query.trim().toLocaleLowerCase('tr');
    // 'tr' locale is used for Turkish characters like 'i' and 'I'

    const filtered = useMemo(() => {
        if(!queryValue){
            return data;
        }
        return data.filter((product) => product.title.toLocaleLowerCase('tr').includes(queryValue));
    }, [data, queryValue]);
    
    return(
        <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map((product) => (
                    <ProductCard key={product.id} product={product}></ProductCard>
                ))}
            </div>

        </div>
    );
}