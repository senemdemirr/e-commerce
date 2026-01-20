"use client";
import { useCart } from "@/context/CartContext";
import { ShoppingCartOutlined } from "@mui/icons-material";
import { Link, Button, Badge } from "@mui/material";

export default function BasketButton() {
    const { quantity } = useCart();

    return (
        <Link href="/basket">
            <Button
                className="!text-gray-600 px-4 py-2 rounded hover:!bg-transparent border-none cursor-pointer"
                startIcon={
                    <Badge
                        badgeContent={quantity}
                        overlap="circular"
                        showZero={false}
                        sx={{
                            "& .MuiBadge-badge": {
                                backgroundColor: "#fb923c",
                                color: "#fff",
                            },
                        }}
                    >
                        <ShoppingCartOutlined></ShoppingCartOutlined>
                    </Badge>
                }
            >
                My Basket
            </Button>
        </Link>
    );
}