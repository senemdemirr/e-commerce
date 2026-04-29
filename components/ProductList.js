"use client";
import ProductCard from "./ProductCard";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { apiFetch } from "@/lib/apiFetch/fetch";
import {
    DEFAULT_PRODUCT_SORT,
    PRODUCT_SORT_OPTIONS,
    getProductSortValue,
    sortProductList,
} from "@/lib/product-list-sort";

export default function ProductList({ products, isFavoritePage = false }) {
    const user = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const sort = getProductSortValue(searchParams.get("sort"));
    const queryValue = query.trim().toLocaleLowerCase('tr');
    const [productList, setProductList] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    // 'tr' locale is used for Turkish characters like 'i' and 'I'

    useEffect(() => {
        setProductList(Array.isArray(products) ? products : []);
    }, [products]);

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

    function handleSortChange(event) {
        const nextSort = getProductSortValue(event.target.value);
        const nextParams = new URLSearchParams(searchParams.toString());

        if (nextSort === DEFAULT_PRODUCT_SORT) {
            nextParams.delete("sort");
        } else {
            nextParams.set("sort", nextSort);
        }

        const queryString = nextParams.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }

    // I used useMemo for unnecessary renders to obstruct and for performance optimization
    const filtered = useMemo(() => {
        let list = productList;
        if (queryValue) {
            list = list.filter((product) => (
                String(product?.title || "").toLocaleLowerCase('tr').includes(queryValue)
            ));
        }
        return sortProductList(list, sort);
    }, [productList, queryValue, sort]);

    // Rerun the filter only if the values ​​in this list change, otherwise use the old result.
    if (filtered?.length === 0) {
        return <div className="py-8 text-center text-gray-500">No products found</div>
    }

    return (
        <div className="container py-8 mx-auto px-4 sm:px-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">{filtered.length} ürün listeleniyor</p>
                <label className="flex w-full flex-col gap-1 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[16rem]">
                    Sıralama
                    <select
                        value={sort}
                        onChange={handleSortChange}
                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                        aria-label="Ürünleri sırala"
                    >
                        {PRODUCT_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
