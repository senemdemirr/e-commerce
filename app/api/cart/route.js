import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

async function getActiveCart(userId) {
    const existing = await pool.query("SELECT * FROM carts WHERE user_id=$1 AND status=$2", [userId, 'active']);

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const created = await pool.query("INSERT INTO carts(user_id,status) VALUES($1,$2) RETURNING *", [userId, 'active']);

    return created.rows[0];
}
export async function GET() {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const cart = await getActiveCart(user.id);
        const itemsRes = await pool.query(`
            SELECT 
                ci.id as id, 
                ci.product_id, 
                ci.quantity,
                ci.unit_price,
                (ci.quantity * ci.unit_price) AS total_price,
                p.title,
                p.image,
                p.brand,
                p.sku,
                ci.selected_size,
                ci.selected_color,
                ci.selected_color_hex,
                c.slug as category_slug,
                sc.slug as subcategory_slug
            FROM cart_items ci 
            JOIN products p ON p.id = ci.product_id 
            JOIN sub_categories sc ON sc.id = p.sub_category_id 
            JOIN categories c ON c.id = sc.category_id 
            WHERE ci.cart_id=$1 
            ORDER BY ci.id ASC
        `, [cart.id]);

        const totalQuantity = itemsRes.rows.reduce((acc, current) => acc + current.quantity, 0);

        return NextResponse.json(
            { cartId: cart.id, totalQuantity, items: itemsRes.rows }, { status: 200 }
        )


    } catch (error) {
        return NextResponse.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )
    }

}
export async function POST(request) {
    try {
        const body = await request.json();
        let { productSku, quantity = 1, selectedSize = null, selectedColor = null, selectedColorHex = null } = body;

        // Normalize empty values to null for consistent DB checks
        selectedSize = selectedSize || null;
        selectedColor = selectedColor || null;
        selectedColorHex = selectedColorHex || null;

        const user = await getOrCreateUserFromSession();

        if (user instanceof NextResponse || !user.id) {
            return user instanceof NextResponse ? user : NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const cart = await getActiveCart(user.id);
        const product = await pool.query("SELECT id FROM products WHERE sku= $1", [productSku]);

        if (product.rows.length === 0) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        const productId = product.rows[0].id;
        const product_price = await pool.query("SELECT price FROM products WHERE id=$1", [productId]);
        const productPrice = product_price.rows[0].price;

        const isExistingProductInCart = await pool.query(
            "SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2 AND (selected_size=$3 OR (selected_size IS NULL AND $3 IS NULL)) AND (selected_color=$4 OR (selected_color IS NULL AND $4 IS NULL))",
            [cart.id, productId, selectedSize, selectedColor]
        );

        if (isExistingProductInCart.rows.length > 0) {
            await pool.query("UPDATE cart_items SET quantity=quantity + $1, updated_at = NOW() WHERE id=$2", [quantity, isExistingProductInCart.rows[0].id]);
        }
        else {
            await pool.query("INSERT INTO cart_items(cart_id,product_id,quantity,unit_price,selected_size,selected_color,selected_color_hex) VALUES($1,$2,$3,$4,$5,$6,$7)", [cart.id, productId, quantity, productPrice, selectedSize, selectedColor, selectedColorHex]);
        }

        const totalRes = await pool.query("SELECT SUM(quantity) as total FROM cart_items WHERE cart_id=$1", [cart.id]);
        const totalQuantity = parseInt(totalRes.rows[0].total) || 0;

        return NextResponse.json(
            { message: "Successfully", totalQuantity },
            { status: 200 }
        )

    } catch (error) {
        console.error("POST /api/cart error:", error);
        return NextResponse.json(
            { message: `Something went wrong: ${error.message || error}` },
            { status: 500 }
        )
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { itemId, quantity } = body;
        const user = await getOrCreateUserFromSession();

        if (!user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const cart = await getActiveCart(user.id);

        if (quantity < 1) {
            return NextResponse.json({ message: "Quantity must be at least 1" }, { status: 400 });
        }

        await pool.query("UPDATE cart_items SET quantity=$1, updated_at = NOW() WHERE id=$2 AND cart_id=$3", [quantity, itemId, cart.id]);

        return NextResponse.json({ message: "Updated" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        const user = await getOrCreateUserFromSession();

        if (!user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const cart = await getActiveCart(user.id);

        await pool.query("DELETE FROM cart_items WHERE id=$1 AND cart_id=$2", [itemId, cart.id]);

        return NextResponse.json({ message: "Deleted" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}