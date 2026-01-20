"use client";
import { useCart } from "@/context/CartContext";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Button } from "@mui/material";

export default function AddToCartButton({ product }) {
    const { addToCart, loading } = useCart();

    const handleClick = () => {
        addToCart(product, 1);
    }

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            startIcon={<AddShoppingCartIcon/>}
            className={`${loading ? "!bg-green-500" : "!bg-orange-500"} !text-white !px-6 py-2 rounded-lg hover:!bg-orange-600 transition`}
        >
            {loading ? "Adding..." : "Add To Cart"}
        </Button>
    )
}