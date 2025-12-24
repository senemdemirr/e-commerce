import { Button } from "@mui/material";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { apiFetch } from "@/lib/apiFetch/fetch";
import Image from "next/image";

async function fetchProductBySku(sku) {
    return await apiFetch(`/api/products/${sku}`);
}

export default async function ProductDetailPage({ params }) {

    const { category, subcategory, sku } = await params;

    const product = await fetchProductBySku(sku);
    if (!product) {
        return notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <nav className="text-sm mb-4 text-gray-500">
                <Link prefetch={false}
                    href={`/${product.categorySlug}`} className="hover:underline">{product.categorySlug}</Link>
                <Link prefetch={false}
                    href={`/${product.categorySlug}/${product.subCategorySlug}`} className="hover:underline">/{product.subCategorySlug}</Link>
                <span className="text-gray-700"> /{product.sku} </span>
            </nav>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className=" p-4 rounded-lg flex items-center justify-center">
                    <Image
                        src={product.image}
                        alt={product.title}
                        className="max-h-full object-cover"
                        width={300}
                        height={300}
                        loading='lazy'
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                    <p className="text-gray-600 mb-4">{product.brand}</p>
                    <p className="text-gray-800 mb-6">{product.description}</p>
                    <span className="text-2xl font-semibold text-orange-500">{product.price} <span className="text-lg font-medium">TL</span></span>
                    <div className="mt-6">
                        <Button className="!bg-orange-500 !text-white !px-6 py-2 rounded-lg hover:bg-orange-600 transition" startIcon={<AddShoppingCartIcon></AddShoppingCartIcon>}>Add to Cart</Button>
                    </div>
                </div>

            </div>
        </div>
    );

}