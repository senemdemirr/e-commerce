import { pool } from "@/lib/db";
import { ensureProductVariantSchema } from "@/lib/productSchema";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
        await ensureProductVariantSchema();

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
                ci.variant_id,
                ci.quantity,
                ci.unit_price,
                (ci.quantity * ci.unit_price) AS total_price,
                p.title,
                p.image,
                p.brand,
                p.sku,
                pv.sku AS variant_sku,
                ci.selected_size,
                ci.selected_color,
                ci.selected_color_hex,
                c.slug as category_slug,
                sc.slug as subcategory_slug
            FROM cart_items ci 
            JOIN products p ON p.id = ci.product_id 
            LEFT JOIN product_variants pv ON pv.id = ci.variant_id
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
        await ensureProductVariantSchema();

        const body = await request.json();
        let {
            productSku,
            quantity = 1,
            selectedSize = null,
            selectedColor = null,
            selectedColorHex = null,
            variantId = null,
        } = body;

        // Normalize empty values to null for consistent DB checks
        selectedSize = selectedSize || null;
        selectedColor = selectedColor || null;
        selectedColorHex = selectedColorHex || null;
        variantId = variantId ? Number(variantId) : null;

        const user = await getOrCreateUserFromSession();

        if (user instanceof NextResponse || !user.id) {
            return user instanceof NextResponse ? user : NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const cart = await getActiveCart(user.id);
        let productId = null;
        let productPrice = null;

        if (variantId) {
            const variantResult = await pool.query(
                `
                    SELECT
                        p.id AS product_id,
                        COALESCE(pv.price, p.price) AS price,
                        pv.stock,
                        c.name AS color_name,
                        c.code AS color_hex,
                        s.name AS size_label
                    FROM product_variants pv
                    JOIN products p ON p.id = pv.product_id
                    LEFT JOIN colors c ON c.id = pv.color_id
                    LEFT JOIN sizes s ON s.id = pv.size_id
                    WHERE pv.id = $1 AND p.sku = $2
                    LIMIT 1
                `,
                [variantId, productSku]
            );

            if (variantResult.rows.length === 0) {
                return NextResponse.json({ message: "Selected variant not found" }, { status: 404 });
            }

            const variant = variantResult.rows[0];

            if (Number(variant.stock || 0) <= 0) {
                return NextResponse.json({ message: "Selected variant is out of stock" }, { status: 400 });
            }

            productId = variant.product_id;
            productPrice = variant.price;
            selectedSize = variant.size_label || selectedSize;
            selectedColor = variant.color_name || selectedColor;
            selectedColorHex = variant.color_hex || selectedColorHex;
        } else {
            const product = await pool.query("SELECT id, price FROM products WHERE sku = $1", [productSku]);

            if (product.rows.length === 0) {
                return NextResponse.json({ message: "Product not found" }, { status: 404 });
            }

            productId = product.rows[0].id;
            productPrice = product.rows[0].price;
        }

        const isExistingProductInCart = await pool.query(
            `
                SELECT *
                FROM cart_items
                WHERE cart_id = $1
                  AND product_id = $2
                  AND (variant_id = $3 OR (variant_id IS NULL AND $3 IS NULL))
                  AND (selected_size = $4 OR (selected_size IS NULL AND $4 IS NULL))
                  AND (selected_color = $5 OR (selected_color IS NULL AND $5 IS NULL))
            `,
            [cart.id, productId, variantId, selectedSize, selectedColor]
        );

        if (isExistingProductInCart.rows.length > 0) {
            await pool.query("UPDATE cart_items SET quantity=quantity + $1, updated_at = NOW() WHERE id=$2", [quantity, isExistingProductInCart.rows[0].id]);
        }
        else {
            await pool.query(
                `
                    INSERT INTO cart_items(
                        cart_id,
                        product_id,
                        variant_id,
                        quantity,
                        unit_price,
                        selected_size,
                        selected_color,
                        selected_color_hex
                    )
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                `,
                [cart.id, productId, variantId, quantity, productPrice, selectedSize, selectedColor, selectedColorHex]
            );
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
        await ensureProductVariantSchema();

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
        await ensureProductVariantSchema();

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
