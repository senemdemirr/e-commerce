import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function ProductCard({ product, onDeleteFavorite }) {
    const user = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const href = `/${product.categorySlug}/${product.subCategorySlug}/${product.sku}`;
    useEffect(() => {
        if (pathname === "/favorites") {
            setIsFavorite(true);
        }
    }, [pathname]);

    async function updateFavorite(e) {
        e.preventDefault();
        setIsFavorite(!isFavorite);
            const res = await fetch(`/api/favorites`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: product.id,
                    user_id: user.id,
                    favorite: isFavorite == false ? true : false
                })
            });
            const data = await res.json();

    }
    async function deleteFavorite(e) {
        e.preventDefault();
        const res = await fetch(`/api/favorites/${product.favorite_id}`, {
            method: "DELETE"
        });
        if (!res.ok) {
            console.log("hata");
        }
        if (onDeleteFavorite) {
            onDeleteFavorite(product.id);
            router.refresh();
        }
    }
    return (
        <Link prefetch={false}
            href={href}>
            <div className="bg-white cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition flex flex-col overflow-hidden border border-gray-100">
                <div className="relative">
                    <Image
                        src={product.image}
                        alt={product.title}
                        className="h-64 w-full object-contain bg-white p-2"
                        loading='lazy'
                        width={300}
                        height={300}
                    />
                    <span className="absolute top-2 right-2 bg-gray-100 border border-gray-200 shadow-2xl text-white text-xs px-1.5 py-1.5 rounded-full">
                        {pathname == "/favorites" ?
                            (<CloseIcon onClick={deleteFavorite} fontSize="medium" color='action'></CloseIcon>) :
                            (
                                isFavorite ?
                                    (<FavoriteIcon onClick={updateFavorite} fontSize="medium" sx={{ color: 'orange' }} />)
                                    :
                                    (<FavoriteBorderIcon onClick={updateFavorite} fontSize="medium" color='action' />)

                            )
                        }



                    </span>
                </div>
                <div className="flex-1 flex flex-col px-4 py-3 gap-1">
                    <h3 className="font-semibold text-md truncate">{product.title}</h3>
                    <span className="text-sm text-gray-500">{product.brand}</span>
                    <span className="text-gray-600 text-xs">{product.description}</span>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-xl font-bold text-orange-400">{product.price} <span className="text-base font-medium">TL</span></span>
                    </div>
                </div>
            </div>
        </Link>
    );
}