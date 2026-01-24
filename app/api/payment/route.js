import iyzipay from "@/lib/iyzipay";
import { getOrCreateUserFromSession } from "@/lib/users";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";

export async function POST(request) {
    const user = await getOrCreateUserFromSession();
    if (!user.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Get Cart
    const cartRes = await pool.query("SELECT * FROM carts WHERE user_id=$1 AND status='active'", [user.id]);
    const cart = cartRes.rows[0];
    if (!cart) return NextResponse.json({ message: "No active cart" }, { status: 400 });

    // Get Items
    const itemsRes = await pool.query("SELECT ci.*, p.title, p.price, p.sku FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id=$1", [cart.id]);
    const items = itemsRes.rows;

    if (items.length === 0) return NextResponse.json({ message: "Cart empty" }, { status: 400 });

    const price = items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
    const paidPrice = price + 50; // + Shipping

    const requestData = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: cart.id.toString(),
        price: price.toFixed(2),
        paidPrice: paidPrice.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        basketId: cart.id.toString(),
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${process.env.APP_BASE_URL}/api/payment/callback`, // Callback usually needed for raw usage, but checkout form handles it
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
            id: user.id.toString(),
            name: user.given_name || "John",
            surname: user.family_name || "Doe",
            gsmNumber: "+905350000000",
            email: user.email || "email@email.com",
            identityNumber: "74300864791",
            lastLoginDate: "2015-10-05 12:43:35",
            registrationDate: "2013-04-21 15:12:09",
            registrationAddress: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
            ip: "85.34.78.112",
            city: "Istanbul",
            country: "Turkey",
            zipCode: "34732"
        },
        shippingAddress: {
            contactName: "Jane Doe",
            city: "Istanbul",
            country: "Turkey",
            address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
            zipCode: "34742"
        },
        billingAddress: {
            contactName: "Jane Doe",
            city: "Istanbul",
            country: "Turkey",
            address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
            zipCode: "34742"
        },
        basketItems: items.map(item => ({
            id: item.product_id.toString(),
            name: item.title,
            category1: "General",
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: (Number(item.unit_price) * item.quantity).toFixed(2)
        }))
    };

    return new Promise((resolve, reject) => {
        iyzipay.checkoutFormInitialize.create(requestData, (err, result) => {
            if (err) {
                resolve(NextResponse.json({ status: "failure", errorMessage: err }, { status: 500 }));
            } else {
                resolve(NextResponse.json(result, { status: 200 }));
            }
        });
    });
}
