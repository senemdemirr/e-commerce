import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from 'notistack';
import { apiFetch } from '@/lib/apiFetch/fetch';

export default function ProductCard({ product, onDeleteFavorite, initialIsFavorite = false, onToggleFavorite }) {
    const user = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const pathname = usePathname();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const href = `/${product.categorySlug}/${product.subCategorySlug}/${product.sku}`;
    useEffect(() => {
        if (pathname === "/favorites") {
            setIsFavorite(true);
            return;
        }
        setIsFavorite(Boolean(initialIsFavorite));
    }, [pathname, initialIsFavorite]);

    async function updateFavorite(e) {
        e.preventDefault();
        if (!user) {
            enqueueSnackbar("You need to sign in to manage favorites.", { variant: "info" });
            return;
        }

        const nextValue = !isFavorite;
        setIsFavorite(nextValue);
        try {
            await apiFetch(`/api/favorites`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: product.id,
                    user_id: user.id,
                    favorite: nextValue
                })
            });
            if (onToggleFavorite) {
                onToggleFavorite(product.id, nextValue);
            }
            enqueueSnackbar(nextValue ? "Product added to favorites." : "Product removed from favorites.", { variant: "success" });
        } catch (error) {
            setIsFavorite(!nextValue);
            enqueueSnackbar("Failed to update favorite status.", { variant: "error" });
        }

    }
    async function deleteFavorite(e) {
        e.preventDefault();
        try {
            await apiFetch(`/api/favorites/${product.favorite_id}`, {
                method: "DELETE"
            });
            enqueueSnackbar("Product removed from favorites.", { variant: "success" });
            if (onDeleteFavorite) {
                onDeleteFavorite(product.id);
                router.refresh();
            }
        } catch (error) {
            enqueueSnackbar("An error occurred while removing favorite.", { variant: "error" });
        }
    }
    return (
        <Link prefetch={false} href={href} className="h-full block">
            <div className="bg-white cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition flex flex-col h-full overflow-hidden border border-gray-100">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading='lazy'
                        width={300}
                        height={400}
                    />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full p-1.5 flex items-center justify-center hover:bg-white transition-colors">
                        {pathname == "/favorites" ?
                            (<CloseIcon onClick={deleteFavorite} fontSize="medium" color='action'></CloseIcon>) :
                            (
                                isFavorite ?
                                    (<FavoriteIcon onClick={updateFavorite} fontSize="medium" sx={{ color: 'orange' }} />)
                                    :
                                    (<FavoriteBorderIcon onClick={updateFavorite} fontSize="medium" color='action' />)

                            )
                        }
                    </div>
                </div>
                <div className="flex-1 flex flex-col px-4 py-3 gap-1">
                    <h3 className="font-semibold text-md truncate" title={product.title}>{product.title}</h3>
                    <span className="text-sm text-gray-500 truncate">{product.brand}</span>
                    <p className="text-gray-600 text-xs hidden lg:block line-clamp-2 min-h-[2.5em]">{product.description}</p>
                    <div className="mt-auto pt-2 flex items-end justify-between">
                        <span className="text-xl font-bold text-orange-400">{product.price} <span className="text-base font-medium">TL</span></span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
