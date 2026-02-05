"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
    CheckCircle,
    Remove,
    Add,
    Delete,
    ArrowBack,
    ArrowForward,
    Lock,
    History,
    SupportAgent,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function BasketPage() {
    const { items, updateItemQuantity, removeFromCart } = useCart();
    const router = useRouter();

    const subtotal = items.reduce(
        (acc, item) => acc + (Number(item.total_price) || (Number(item.unit_price) * item.quantity)),
        0
    );
    const shipping = subtotal >= 1000 ? 0 : 49.90;
    const total = subtotal + shipping;

    const handleCheckout = () => {
        router.push("/checkout");
    };

    if (items.length === 0) {
        return (
            <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
                    <h2 className="text-2xl font-bold text-text-main dark:text-white">Your Cart is Empty</h2>
                    <p className="text-text-muted dark:text-gray-400">You haven't added any items to your cart yet.</p>
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-[1px]"
                    >
                        <ArrowBack className="text-lg" />
                        Start Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Breadcrumb / Progress Bar */}
            <div className="mb-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold tracking-tight text-text-main dark:text-white md:text-4xl">
                            My Cart
                        </h1>
                        <span className="text-sm font-medium text-text-muted dark:text-gray-400">
                            {items.reduce((acc, item) => acc + item.quantity, 0)} Items Added
                        </span>
                    </div>
                    <div className="mt-4 flex w-full flex-col gap-2">
                        <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className="absolute left-0 top-0 h-full w-1/3 rounded-full bg-primary shadow-sm shadow-primary/50"></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-text-muted dark:text-gray-500">
                            <span className="text-primary">Cart</span>
                            <span>Delivery &amp; Payment</span>
                            <span>Completed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                {/* Left Column: Product List */}
                <div className="flex-1 flex flex-col gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="group relative flex flex-col gap-4 rounded-2xl bg-surface-light p-4 shadow-sm transition-all hover:shadow-md dark:bg-surface-dark sm:flex-row sm:items-center sm:p-5 border border-transparent hover:border-primary/10"
                        >

                            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 sm:w-32 cursor-pointer">
                                <Link href={`/${item.category_slug}/${item.subcategory_slug}/${item.sku}`}>
                                    <img
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        src={item.image || "https://placehold.co/400"}
                                    />
                                </Link>
                            </div>
                            <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <Link href={`/${item.category_slug}/${item.subcategory_slug}/${item.sku}`}>
                                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                        </Link>
                                    </div>
                                    <p className="text-sm text-text-muted dark:text-gray-400">
                                        {item.brand ? `Brand: ${item.brand}` : ''}
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-1">
                                        {item.selected_size && (
                                            <p className="text-sm font-medium text-text-muted dark:text-gray-400 flex items-center gap-1">
                                                Size: <span className="font-bold text-text-dark dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{item.selected_size}</span>
                                            </p>
                                        )}
                                        {item.selected_color && (
                                            <div className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-400">
                                                <span>Color:</span>
                                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                                                    {item.selected_color_hex && (
                                                        <div
                                                            className="w-3 h-3 rounded-full border border-gray-200"
                                                            style={{ backgroundColor: item.selected_color_hex }}
                                                        />
                                                    )}
                                                    <span className="text-xs font-bold text-text-dark dark:text-white">{item.selected_color}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle className="text-sm" fontSize="small" /> In Stock
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-6 sm:justify-end">
                                    {/* Quantity Control */}
                                    <div className="flex h-10 items-center rounded-xl bg-background-light p-1 dark:bg-white/5">
                                        <button
                                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg bg-white text-text-main shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:bg-surface-dark dark:text-white transition-colors"
                                        >
                                            <Remove className="text-base" fontSize="small" />
                                        </button>
                                        <input
                                            className="w-12 border-none bg-transparent p-0 text-center text-sm font-bold text-text-main focus:ring-0 dark:text-white outline-none"
                                            readOnly
                                            type="number"
                                            value={item.quantity}
                                        />
                                        <button
                                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg bg-white text-text-main shadow-sm hover:bg-gray-50 dark:bg-surface-dark dark:text-white transition-colors"
                                        >
                                            <Add className="text-base" fontSize="small" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-lg font-bold text-text-main dark:text-white">
                                            ₺{(Number(item.team_price) || (Number(item.unit_price) * item.quantity)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="cursor-pointer absolute top-4 right-4 p-2 text-text-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 sm:static sm:p-0 sm:hover:bg-transparent sm:dark:hover:bg-transparent"
                            >
                                <Delete />
                            </button>
                        </div>
                    ))}

                    <Link
                        href="/"
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                        <ArrowBack className="text-lg" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Right Column: Order Summary */}
                <div className="w-full lg:w-[380px] xl:w-[420px]">
                    <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/50 dark:bg-surface-dark dark:shadow-black/20 border border-gray-100 dark:border-white/5">
                        <h2 className="text-xl font-bold text-text-main dark:text-white mb-6">
                            Order Summary
                        </h2>
                        <div className="mb-6 flex flex-col gap-3 border-b border-dashed border-gray-200 pb-6 dark:border-gray-700">
                            <div className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-text-main dark:text-white">
                                    ₺{subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                                <span>Shipping</span>
                                <span className={`font-medium ${shipping === 0 ? "text-green-500" : "text-primary"}`}>
                                    {shipping === 0 ? "Free" : `₺${shipping.toFixed(2)}`}
                                </span>
                            </div>
                        </div>
                        <div className="mb-8 flex items-end justify-between">
                            <span className="text-lg font-bold text-text-main dark:text-white">
                                Total
                            </span>
                            <span className="text-2xl font-black text-text-main dark:text-white tracking-tight">
                                ₺{total.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCheckout}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-[1px]"
                            >
                                Checkout
                                <ArrowForward className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        {/* Trust Signals */}
                        <div className="mt-8 flex justify-center gap-4 text-gray-400 dark:text-gray-600">
                            <div className="flex flex-col items-center gap-1">
                                <Lock className="text-xl" />
                                <span className="text-[10px] font-medium">Secure Payment</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex flex-col items-center gap-1">
                                <History className="text-xl" />
                                <span className="text-[10px] font-medium">30 Day Return</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex flex-col items-center gap-1">
                                <SupportAgent className="text-xl" />
                                <span className="text-[10px] font-medium">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
