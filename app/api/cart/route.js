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
                c.slug as category_slug,
                sc.slug as subcategory_slug
            FROM cart_items ci 
            JOIN products p ON p.id = ci.product_id 
            JOIN sub_categories sc ON sc.id = p.sub_category_id 
            JOIN categories c ON c.id = sc.category_id 
            WHERE ci.cart_id=$1 
            ORDER BY ci.id ASC
        `, [cart.id]);

        return NextResponse.json(
            { cartId: cart.id, totalQuantity: itemsRes.rows.length, items: itemsRes.rows }, { status: 200 }
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
        const { productSku, quantity = 1 } = body;

        const user = await getOrCreateUserFromSession();

        if (!user.id) {
            return NextResponse.json(
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

        const isExistingProductInCart = await pool.query("SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2", [cart.id, productId]);

        if (isExistingProductInCart.rows.length > 0) {
            await pool.query("UPDATE cart_items SET quantity=quantity + $1, updated_at = NOW() WHERE id=$2", [quantity, isExistingProductInCart.rows[0].id]);
        }
        else {
            await pool.query("INSERT INTO cart_items(cart_id,product_id,quantity,unit_price) VALUES($1,$2,$3,$4)", [cart.id, productId, quantity, productPrice]);
        }

        const currentRes = await pool.query("SELECT ci.id ,ci.product_id,ci.quantity,ci.unit_price,p.title,p.image,p.brand FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id=$1", [cart.id]);

        return NextResponse.json(
            { message: "Successfully", totalQuantity: currentRes.rows.length },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: `Something went wrong: ${error}` },
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