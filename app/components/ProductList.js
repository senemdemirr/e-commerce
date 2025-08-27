"use client";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ProductList({products,fixedCategorySlug=null,fixedSubCategorySlug=null}) {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const queryValue = query.trim().toLocaleLowerCase('tr');
    // 'tr' locale is used for Turkish characters like 'i' and 'I'

    // I used useMemo for unnecessary renders to obstruct and for performance optimization
    const filtered = useMemo(() => {
        let list = products;
        if(fixedCategorySlug){
            list = list.filter((product) => product.categorySlug === fixedCategorySlug);
        }
        if(fixedSubCategorySlug){
            list = list.filter((product) => product.subCategorySlug === fixedSubCategorySlug);
        }
        if(queryValue){
            list = list.filter((product) => product.title.toLocaleLowerCase('tr').includes(queryValue))
        }
        return list;
    }, [products,queryValue,fixedCategorySlug,fixedSubCategorySlug]);

    if(filtered.length === 0){
        return <div className="py-8 text-center text-gray-500">No products found</div>
    }
    
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