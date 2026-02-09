import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";
import iyzipay from "@/lib/iyzipay";
import Iyzipay from "iyzipay";

// POST - Process checkout and create order
export async function POST(request) {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            shipping_address_id,
            card_holder_name,
            card_number,
            expire_month,
            expire_year,
            cvc,
            save_card = false
        } = body;

        // Validate required fields
        if (!shipping_address_id || !card_holder_name || !card_number || !expire_month || !expire_year || !cvc) {
            return NextResponse.json(
                { message: "Missing required payment or address information" },
                { status: 400 }
            );
        }

        // Fetch shipping address with city, district, and neighborhood names
        const addressResult = await pool.query(
            `SELECT 
                ua.id, 
                ua.address_title,
                ua.address_line,
                ua.recipient_first_name, 
                ua.recipient_last_name, 
                ua.recipient_phone,
                n.name as neighborhood_name, 
                n.id as neighborhood_id, 
                d.name as district_name,
                d.id as district_id, 
                c.name as city_name,
                c.id as city_id 
             FROM user_addresses ua 
             JOIN neighborhoods n ON n.id = ua.neighborhood_id 
             JOIN districts d ON n.district_id = d.id 
             JOIN cities c ON d.city_id = c.id 
             WHERE ua.id = $1 AND ua.user_id = $2`,
            [shipping_address_id, user.id]
        );

        if (addressResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Invalid shipping address" },
                { status: 400 }
            );
        }

        const shippingAddress = addressResult.rows[0];

        // Fetch cart
        const cartResult = await pool.query(
            "SELECT * FROM carts WHERE user_id = $1 AND status = 'active' LIMIT 1",
            [user.id]
        );

        if (cartResult.rows.length === 0) {
            return NextResponse.json(
                { message: "No active cart found" },
                { status: 400 }
            );
        }

        const cart = cartResult.rows[0];

        // Get cart items
        const itemsResult = await pool.query(
            `SELECT ci.*, p.title, p.price, p.sku 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             WHERE ci.cart_id = $1`,
            [cart.id]
        );

        if (itemsResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Cart is empty" },
                { status: 400 }
            );
        }

        const items = itemsResult.rows;

        // Calculate totals
        const subtotal = items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const shippingCost = subtotal >= 1000 ? 0 : 49.90;
        const totalAmount = subtotal + shippingCost;

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${user.id}`;

        // Prepare Iyzico payment request
        const paymentCard = {
            cardHolderName: card_holder_name,
            cardNumber: card_number.replace(/\s/g, ''),
            expireMonth: expire_month,
            expireYear: expire_year,
            cvc: cvc,
            registerCard: save_card ? '1' : '0'
        };

        const buyer = {
            id: user.id.toString(),
            name: user.name?.split(' ')[0] || shippingAddress.recipient_first_name || "Customer",
            surname: user.name?.split(' ')[1] || shippingAddress.recipient_last_name || "User",
            gsmNumber: shippingAddress.recipient_phone,
            email: user.email || "customer@example.com",
            identityNumber: "11111111111", // In production, collect this from user
            lastLoginDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            registrationDate: new Date(user.created_at).toISOString().replace('T', ' ').substring(0, 19),
            registrationAddress: shippingAddress.address_line,
            ip: request.headers.get('x-forwarded-for') || "85.34.78.112",
            city: shippingAddress.city_name,
            country: "Turkey",
            zipCode: "34000"
        };

        const shippingAddressData = {
            contactName: `${shippingAddress.recipient_first_name} ${shippingAddress.recipient_last_name}`,
            city: shippingAddress.city_name,
            country: "Turkey",
            address: shippingAddress.address_line,
            zipCode: "34000"
        };

        const billingAddress = { ...shippingAddressData };

        const basketItems = items.map(item => ({
            id: item.product_id.toString(),
            name: item.title.substring(0, 100), // Iyzico has character limits
            category1: "Product",
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: (Number(item.unit_price) * item.quantity).toFixed(2)
        }));

        // Add shipping as basket item if applicable
        if (shippingCost > 0) {
            basketItems.push({
                id: "SHIPPING",
                name: "Shipping Cost",
                category1: "Shipping",
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: shippingCost.toFixed(2)
            });
        }

        // Calculate final paid price from basket items to avoid mismatch errors
        const finalPaidPrice = basketItems.reduce((acc, item) => acc + parseFloat(item.price), 0).toFixed(2);

        const paymentRequest = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: orderNumber,
            price: finalPaidPrice, // subtotal including shipping
            paidPrice: finalPaidPrice,
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            basketId: cart.id.toString(),
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            paymentCard: paymentCard,
            buyer: buyer,
            shippingAddress: shippingAddressData,
            billingAddress: billingAddress,
            basketItems: basketItems
        };

        // Process payment with Iyzico
        return new Promise((resolve) => {
            iyzipay.payment.create(paymentRequest, async (err, result) => {
                if (err) {
                    console.error("Iyzico payment error:", err);
                    resolve(NextResponse.json(
                        { message: "Payment failed", error: err },
                        { status: 500 }
                    ));
                    return;
                }

                if (result.status !== 'success') {
                    console.error("Iyzico payment failed:", result);
                    resolve(NextResponse.json(
                        { message: "Payment failed", error: result.errorMessage },
                        { status: 400 }
                    ));
                    return;
                }

                try {
                    // Payment successful - Create order in database
                    const orderResult = await pool.query(
                        `INSERT INTO orders 
                         (user_id, order_number, status, subtotal, shipping_cost, total_amount,
                          shipping_address_id, shipping_full_name, shipping_phone, shipping_address,
                          shipping_city, shipping_district, shipping_postal_code,
                          payment_method, payment_status, iyzico_payment_id, iyzico_conversation_id,
                          card_mask, card_family, card_bank)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                         RETURNING *`,
                        [
                            user.id,
                            orderNumber,
                            8,
                            subtotal,
                            shippingCost,
                            totalAmount,
                            shipping_address_id,
                            `${shippingAddress.recipient_first_name} ${shippingAddress.recipient_last_name}`,
                            shippingAddress.recipient_phone,
                            shippingAddress.address_line,
                            shippingAddress.city_name,
                            shippingAddress.district_name,
                            "34000",
                            'credit_card',
                            'completed',
                            result.paymentId,
                            result.conversationId,
                            `${result.binNumber} **** ${result.lastFourDigits}`,
                            result.cardFamily || result.cardAssociation,
                            result.cardBankName
                        ]
                    );

                    const order = orderResult.rows[0];

                    // Create order items
                    for (const item of items) {
                        await pool.query(
                            `INSERT INTO order_items 
                             (order_id, product_id, product_title, product_sku, quantity, 
                              unit_price, total_price, selected_size, selected_color, selected_color_hex)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [
                                order.id,
                                item.product_id,
                                item.title,
                                item.sku,
                                item.quantity,
                                item.unit_price,
                                Number(item.unit_price) * item.quantity,
                                item.selected_size,
                                item.selected_color,
                                item.selected_color_hex
                            ]
                        );
                    }

                    // Save card token if requested
                    if (save_card && result.cardToken) {
                        await pool.query(
                            `INSERT INTO payment_cards 
                             (user_id, card_token, card_alias, card_family, card_bank_name, is_default)
                             VALUES ($1, $2, $3, $4, $5, $6)`,
                            [
                                user.id,
                                result.cardToken,
                                result.cardAssociation || `Card ending in ${card_number.slice(-4)}`,
                                result.cardFamily || 'Unknown',
                                result.cardBankName || 'Unknown',
                                false
                            ]
                        );
                    }

                    // Clear cart
                    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
                    await pool.query("UPDATE carts SET status = 'completed' WHERE id = $1", [cart.id]);

                    resolve(NextResponse.json(
                        {
                            message: "Order placed successfully",
                            order: order,
                            payment: {
                                paymentId: result.paymentId,
                                status: result.status
                            }
                        },
                        { status: 200 }
                    ));
                } catch (dbError) {
                    console.error("Database error after payment:", dbError);
                    resolve(NextResponse.json(
                        { message: "Payment succeeded but order creation failed. Please contact support.", error: dbError.message },
                        { status: 500 }
                    ));
                }
            });
        });
    } catch (error) {
        console.error("POST /api/checkout error:", error);
        return NextResponse.json(
            { message: `Checkout error: ${error.message}` },
            { status: 500 }
        );
    }
}
