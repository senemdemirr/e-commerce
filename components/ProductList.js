"use client";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { apiFetch } from "@/lib/apiFetch/fetch";

export default function ProductList({ products, isFavoritePage = false}) {
    const user = useUser();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const queryValue = query.trim().toLocaleLowerCase('tr');
    const [productList, setProductList] = useState(products);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    // 'tr' locale is used for Turkish characters like 'i' and 'I'

    useEffect(() => {
        if (isFavoritePage) {
            setFavoriteIds(new Set((products || []).map((product) => product.id)));
            return;
        }
        if (!user) {
            setFavoriteIds(new Set());
            return;
        }
        let active = true;
        const fetchFavorites = async () => {
            try {
                const res = await apiFetch(`/api/favorites?userId=${user.id}`);
                if (!active) return;
                const ids = Array.isArray(res) ? res.map((item) => item.id) : [];
                setFavoriteIds(new Set(ids));
            } catch (error) {
                if (!active) return;
                if (error?.status === 401) {
                    setFavoriteIds(new Set());
                    return;
                }
                console.log(error);
            }
        };
        fetchFavorites();
        return () => {
            active = false;
        };
    }, [user, isFavoritePage, products]);

    function handleDeleteFavorite(product_id) {
        setProductList((item) => item.filter((p) => p.id !== product_id));
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(product_id);
            return next;
        });
    }

    function handleToggleFavorite(product_id, nextValue) {
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (nextValue) {
                next.add(product_id);
            } else {
                next.delete(product_id);
            }
            return next;
        });
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
        <div className="container py-8 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered?.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        initialIsFavorite={favoriteIds.has(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onDeleteFavorite={isFavoritePage ? handleDeleteFavorite : undefined}
                    ></ProductCard>
                ))}
            </div>

        </div>
    );
}
