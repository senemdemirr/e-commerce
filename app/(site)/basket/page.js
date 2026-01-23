"use client";
import { useCart } from "@/context/CartContext";

export default function BasketPage() {
    const { items } = useCart();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Basket</h1>

            {items.length > 0 ? (
                <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    <div className="flex flex-col gap-6">
                        {items.map((item) => (
                            <li key={item.id} className="border p-2 rounded">
                                {item.title}
                            </li>
                        ))}

                    </div>
                </div>
            ) : (
                <p>This is where your basket items will be displayed.</p>
            )}
        </div>
    );
}
