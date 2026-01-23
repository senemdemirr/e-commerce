import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";

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
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const cart = await getActiveCart(user.id);
        const itemsRes = await pool.query("SELECT ci.id as id, ci.product_id, ci.quantity,ci.unit_price,(ci.quantity * ci.unit_price) AS total_price,p.title,p.image,p.brand,p.sku FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id=$1", [cart.id]);

        return Response.json(
            { cartId: cart.id, totalQuantity: itemsRes.rows.length, items: itemsRes.rows }, { status: 200 }
        )


    } catch (error) {
        return Response.json(
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
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }
        const cart = await getActiveCart(user.id);
        const product = await pool.query("SELECT id FROM products WHERE sku= $1", [productSku]);
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

        return Response.json(
            { message: "Successfully" , totalQuantity: currentRes.rows.length},
            { status: 200 }
        )

    } catch (error) {
        return Response.json(
            { message: `Something went wrong: ${error}` },
            { status: 500 }
        )
    }
}