"use client";
import ProductCard from "./ProductCard";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";

export default function ProductList({ products }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const queryValue = query.trim().toLocaleLowerCase('tr');
    // 'tr' locale is used for Turkish characters like 'i' and 'I'

    // I used useMemo for unnecessary renders to obstruct and for performance optimization
    const filtered = useMemo(() => {
        let list = products;
        if (queryValue) {
            list = list.filter((product) => product.title.toLocaleLowerCase('tr').includes(queryValue))
        }
        return list;
    }, [products, queryValue]);
    // Rerun the filter only if the values ​​in this list change, otherwise use the old result.
    if (filtered?.length === 0) {
        if (pathname == "/favorites") {
            router.push("/auth/login");
        }
        else {
            return <div className="py-8 text-center text-gray-500">No products found</div>
        }
    }

    return (
        <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered?.map((product) => (
                    <ProductCard key={product.id} product={product}></ProductCard>
                ))}
            </div>

        </div>
    );
}