import iyzipay from "@/lib/iyzipay";
import { getOrCreateUserFromSession } from "@/lib/users";
import { pool } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/env";
import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";

const DEFAULT_BUYER_DATA = {
    name: "John",
    surname: "Doe",
    gsmNumber: "+905350000000",
    email: "email@email.com",
    identityNumber: "74300864791",
    lastLoginDate: "2015-10-05 12:43:35",
    registrationDate: "2013-04-21 15:12:09",
    registrationAddress: "Nidakule Goztepe, Merdivenkoy Mah. Bora Sok. No:1",
    ip: "85.34.78.112",
    city: "Istanbul",
    country: "Turkey",
    zipCode: "34732"
};

const DEFAULT_ADDRESS_DATA = {
    contactName: "Jane Doe",
    city: "Istanbul",
    country: "Turkey",
    address: "Nidakule Goztepe, Merdivenkoy Mah. Bora Sok. No:1",
    zipCode: "34742"
};

function formatIyzipayDate(value, fallback) {
    if (!value) return fallback;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toISOString().replace("T", " ").substring(0, 19);
}

export async function POST() {
    const callbackUrl = new URL("/api/payment/callback", getAppBaseUrl()).toString();
    const user = await getOrCreateUserFromSession();
    if (!user.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const addressRes = await pool.query(
        `SELECT
            ua.address_line,
            ua.recipient_first_name,
            ua.recipient_last_name,
            ua.recipient_phone,
            c.name AS city_name
         FROM user_addresses ua
         LEFT JOIN neighborhoods n ON n.id = ua.neighborhood_id
         LEFT JOIN districts d ON d.id = COALESCE(ua.district_id, n.district_id)
         LEFT JOIN cities c ON c.id = COALESCE(ua.city_id, d.city_id)
         WHERE ua.user_id = $1
         ORDER BY ua.id DESC
         LIMIT 1`,
        [user.id]
    );
    const address = addressRes.rows[0];

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

    const contactName = [address?.recipient_first_name, address?.recipient_last_name].filter(Boolean).join(" ");
    const shippingAddress = {
        contactName: contactName || DEFAULT_ADDRESS_DATA.contactName,
        city: address?.city_name || DEFAULT_ADDRESS_DATA.city,
        country: DEFAULT_ADDRESS_DATA.country,
        address: address?.address_line || DEFAULT_ADDRESS_DATA.address,
        zipCode: DEFAULT_ADDRESS_DATA.zipCode
    };

    const buyer = {
        id: user.id.toString(),
        name: user.name || address?.recipient_first_name || DEFAULT_BUYER_DATA.name,
        surname: user.surname || address?.recipient_last_name || DEFAULT_BUYER_DATA.surname,
        gsmNumber: user.phone || address?.recipient_phone || DEFAULT_BUYER_DATA.gsmNumber,
        email: user.email || DEFAULT_BUYER_DATA.email,
        identityNumber: DEFAULT_BUYER_DATA.identityNumber,
        lastLoginDate: DEFAULT_BUYER_DATA.lastLoginDate,
        registrationDate: formatIyzipayDate(user.created_at, DEFAULT_BUYER_DATA.registrationDate),
        registrationAddress: address?.address_line || DEFAULT_BUYER_DATA.registrationAddress,
        ip: DEFAULT_BUYER_DATA.ip,
        city: address?.city_name || DEFAULT_BUYER_DATA.city,
        country: DEFAULT_BUYER_DATA.country,
        zipCode: DEFAULT_BUYER_DATA.zipCode
    };

    const requestData = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: cart.id.toString(),
        price: price.toFixed(2),
        paidPrice: paidPrice.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        basketId: cart.id.toString(),
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl, // Callback usually needed for raw usage, but checkout form handles it
        enabledInstallments: [2, 3, 6, 9],
        buyer,
        shippingAddress,
        billingAddress: shippingAddress,
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
