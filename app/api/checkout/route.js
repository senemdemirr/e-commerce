export const runtime = "nodejs";
import { pool } from "@/lib/db";
import { ensureCampaignSchema } from "@/lib/admin/campaignSchema";
import { ensurePaymentCardSchema } from "@/lib/paymentCards";
import { ensureProductVariantSchema } from "@/lib/productSchema";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";
import iyzipay from "@/lib/iyzipay";
import Iyzipay from "iyzipay";
import {
    calculateCampaignDiscountAmount,
    isCampaignRedeemable,
    normalizeCampaignCode,
    normalizeCampaignRecord,
    roundMoney,
} from "@/lib/admin/campaigns";
import {
    incrementFallbackCampaignUsage,
    isAdminTestMode,
    listFallbackCampaignRecords,
} from "@/lib/admin/test-data";

function retrieveBankNameFromBin(binNumber, conversationId) {
    return new Promise((resolve) => {
        if (!binNumber) {
            resolve(null);
            return;
        }

        iyzipay.binNumber.retrieve(
            {
                locale: Iyzipay.LOCALE.TR,
                conversationId,
                binNumber,
            },
            (err, result) => {
                if (err) {
                    console.error("Iyzico bin lookup error:", err);
                    resolve(null);
                    return;
                }

                resolve(
                    result?.cardBankName
                    || result?.bankName
                    || result?.bank
                    || null
                );
            }
        );
    });
}

function getVariantStockIssue(items = []) {
    for (const item of items) {
        if (!item?.variant_id) {
            continue;
        }

        const requestedQuantity = Number(item.quantity || 0);
        const availableStock = Number(item.variant_stock || 0);

        if (availableStock <= 0) {
            return {
                message: `${item.title} is out of stock for the selected variant.`,
                status: 400,
            };
        }

        if (requestedQuantity > availableStock) {
            return {
                message: `${item.title} only has ${availableStock} item(s) left for the selected variant.`,
                status: 400,
            };
        }
    }

    return null;
}

function toCents(value) {
    return Math.round(Number(value || 0) * 100);
}

function fromCents(value) {
    return Number((Number(value || 0) / 100).toFixed(2));
}

function buildDiscountedBasketItems(items = [], discountAmount = 0, shippingCost = 0) {
    const productTotalsCents = items.map((item) => (
        toCents(Number(item.unit_price || 0) * Number(item.quantity || 0))
    ));
    const productSubtotalCents = productTotalsCents.reduce((acc, value) => acc + value, 0);
    const discountCents = Math.min(Math.max(0, toCents(discountAmount)), productSubtotalCents);
    let allocatedDiscountCents = 0;

    const basketItems = items.map((item, index) => {
        const originalCents = productTotalsCents[index] || 0;
        let itemDiscountCents = 0;

        if (discountCents > 0 && productSubtotalCents > 0) {
            if (index === items.length - 1) {
                itemDiscountCents = Math.max(0, discountCents - allocatedDiscountCents);
            } else {
                itemDiscountCents = Math.floor((discountCents * originalCents) / productSubtotalCents);
                allocatedDiscountCents += itemDiscountCents;
            }
        }

        const adjustedCents = Math.max(0, originalCents - itemDiscountCents);

        return {
            id: item.product_id.toString(),
            name: item.title.substring(0, 100),
            category1: "Product",
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: (adjustedCents / 100).toFixed(2),
        };
    });

    if (shippingCost > 0) {
        basketItems.push({
            id: "SHIPPING",
            name: "Shipping Cost",
            category1: "Shipping",
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: shippingCost.toFixed(2),
        });
    }

    const discountedSubtotalCents = Math.max(0, productSubtotalCents - discountCents);
    const shippingCents = toCents(shippingCost);
    const finalPaidPriceCents = discountedSubtotalCents + shippingCents;

    return {
        basketItems,
        discountedSubtotal: fromCents(discountedSubtotalCents),
        finalPaidPrice: fromCents(finalPaidPriceCents),
    };
}

async function findRedeemableCampaignByCode(code) {
    const normalizedCode = normalizeCampaignCode(code);

    if (!normalizedCode) {
        return null;
    }

    if (isAdminTestMode()) {
        return listFallbackCampaignRecords()
            .map((campaign) => normalizeCampaignRecord(campaign))
            .find((campaign) => campaign.code === normalizedCode && isCampaignRedeemable(campaign)) || null;
    }

    await ensureCampaignSchema();

    const result = await pool.query(
        `
            SELECT
                id,
                title,
                code,
                description,
                discount_type,
                discount_value,
                starts_at,
                ends_at,
                is_active,
                usage_limit,
                used_count,
                created_at,
                updated_at
            FROM campaigns
            WHERE UPPER(code) = UPPER($1)
            LIMIT 1
        `,
        [normalizedCode]
    );

    const campaign = result.rows[0] ? normalizeCampaignRecord(result.rows[0]) : null;
    return campaign && isCampaignRedeemable(campaign) ? campaign : null;
}

// POST - Process checkout and create order
export async function POST(request) {
    try {
        await ensureProductVariantSchema();

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
            payment_card_id,
            campaign_code,
            card_holder_name,
            card_number,
            expire_month,
            expire_year,
            cvc,
            save_card = false
        } = body;

        const useSavedCard = Boolean(payment_card_id);

        // Validate required fields
        if (!shipping_address_id) {
            return NextResponse.json(
                { message: "Missing required payment or address information" },
                { status: 400 }
            );
        }

        if (!useSavedCard && (!card_holder_name || !card_number || !expire_month || !expire_year || !cvc)) {
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
            `SELECT ci.*, p.title, p.price, p.sku, pv.sku AS variant_sku, pv.stock AS variant_stock
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.id 
             LEFT JOIN product_variants pv ON pv.id = ci.variant_id
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
        const stockIssue = getVariantStockIssue(items);

        if (stockIssue) {
            return NextResponse.json(
                { message: stockIssue.message },
                { status: stockIssue.status }
            );
        }

        // Calculate totals
        const subtotal = roundMoney(items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0));
        const shippingCost = subtotal >= 1000 ? 0 : 49.90;
        const campaign = campaign_code ? await findRedeemableCampaignByCode(campaign_code) : null;

        if (campaign_code && !campaign) {
            return NextResponse.json(
                { message: "Invalid or expired campaign code" },
                { status: 400 }
            );
        }

        const discountAmount = campaign ? calculateCampaignDiscountAmount(campaign, subtotal) : 0;
        const discountedSubtotal = roundMoney(Math.max(0, subtotal - discountAmount));
        const totalAmount = roundMoney(discountedSubtotal + shippingCost);

        const { basketItems, finalPaidPrice } = buildDiscountedBasketItems(items, discountAmount, shippingCost);

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${user.id}`;
        const shouldSaveCard = !useSavedCard && Boolean(save_card);
        let sanitizedCardNumber = null;
        let paymentCard;

        if (useSavedCard) {
            await ensurePaymentCardSchema();

            const savedCardResult = await pool.query(
                `SELECT id,
                        card_holder_name,
                        card_token,
                        card_user_key,
                        COALESCE(
                            card_user_key,
                            (
                                SELECT fallback_cards.card_user_key
                                FROM payment_cards fallback_cards
                                WHERE fallback_cards.user_id = payment_cards.user_id
                                  AND fallback_cards.card_user_key IS NOT NULL
                                ORDER BY fallback_cards.is_default DESC, fallback_cards.id DESC
                                LIMIT 1
                            )
                        ) AS resolved_card_user_key
                 FROM payment_cards
                 WHERE id = $1 AND user_id = $2
                 LIMIT 1`,
                [payment_card_id, user.id]
            );

            if (savedCardResult.rows.length === 0) {
                return NextResponse.json(
                    { message: "Invalid saved payment card" },
                    { status: 400 }
                );
            }

            const savedCard = savedCardResult.rows[0];

            if (!savedCard.card_token || !savedCard.resolved_card_user_key) {
                return NextResponse.json(
                    { message: "This saved card needs to be re-saved before it can be used for one-click checkout." },
                    { status: 400 }
                );
            }

            if (!savedCard.card_user_key) {
                await pool.query(
                    `UPDATE payment_cards
                     SET card_user_key = $1
                     WHERE id = $2 AND user_id = $3`,
                    [savedCard.resolved_card_user_key, savedCard.id, user.id]
                );
            }

            paymentCard = {
                cardToken: savedCard.card_token,
                cardUserKey: savedCard.resolved_card_user_key
            };
        } else {
            sanitizedCardNumber = card_number.replace(/\s/g, '');

            paymentCard = {
                cardHolderName: card_holder_name,
                cardNumber: sanitizedCardNumber,
                expireMonth: expire_month,
                expireYear: expire_year,
                cvc: cvc,
                registerCard: shouldSaveCard ? '1' : '0'
            };
        }

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

        if (finalPaidPrice <= 0) {
            return NextResponse.json(
                { message: "The order total must be greater than zero after applying the campaign" },
                { status: 400 }
            );
        }

        const paymentRequest = {
            locale: Iyzipay.LOCALE.EN,
            conversationId: orderNumber,
            price: finalPaidPrice.toFixed(2), // subtotal including shipping after campaign discount
            paidPrice: finalPaidPrice.toFixed(2),
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
                        { message: err, error: err },
                        { status: 500 }
                    ));
                    return;
                }

                if (result.status !== 'success') {
                    console.error("Iyzico payment failed:", result);
                    resolve(NextResponse.json(
                        { message: result.errorMessage, error: result.errorMessage },
                        { status: 400 }
                    ));
                    return;
                }

                try {
                    const resolvedCardBankName = result.cardBankName
                        || await retrieveBankNameFromBin(
                            result.binNumber || sanitizedCardNumber?.slice(0, 6),
                            result.conversationId || orderNumber
                        )
                        || "Unknown";
                    let client;

                    if (shouldSaveCard && result.cardToken) {
                        await ensurePaymentCardSchema();
                    }

                    client = await pool.connect();

                    try {
                        await client.query('BEGIN');

                        for (const item of items) {
                            if (!item.variant_id) {
                                continue;
                            }

                            const stockUpdateResult = await client.query(
                                `
                                    UPDATE product_variants
                                    SET stock = stock - $1
                                    WHERE id = $2
                                      AND stock >= $1
                                    RETURNING id, stock
                                `,
                                [item.quantity, item.variant_id]
                            );

                            if (stockUpdateResult.rowCount === 0) {
                                throw new Error(`Insufficient stock for variant ${item.variant_id}`);
                            }
                        }

                        // Payment successful - Create order in database
                        const orderResult = await client.query(
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
                                discountedSubtotal,
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
                                resolvedCardBankName
                            ]
                        );

                        const order = orderResult.rows[0];
                        let updatedCampaignUsage = null;

                        if (campaign) {
                            if (isAdminTestMode()) {
                                updatedCampaignUsage = incrementFallbackCampaignUsage(campaign.id, 1);
                            } else {
                                const campaignUsageResult = await client.query(
                                    `
                                        UPDATE campaigns
                                        SET used_count = CASE
                                                WHEN usage_limit IS NULL THEN used_count + 1
                                                ELSE LEAST(usage_limit, used_count + 1)
                                            END,
                                            updated_at = CURRENT_TIMESTAMP
                                        WHERE id = $1
                                        RETURNING *
                                    `,
                                    [campaign.id]
                                );

                                updatedCampaignUsage = campaignUsageResult.rows[0]
                                    ? normalizeCampaignRecord(campaignUsageResult.rows[0])
                                    : null;
                            }
                        }

                        if (campaign && !updatedCampaignUsage) {
                            throw new Error("Campaign usage could not be updated");
                        }

                        const responseOrder = {
                            ...order,
                            discount_amount: discountAmount,
                            campaign_code: campaign?.code || null,
                            original_subtotal: subtotal,
                        };

                        // Create order items
                        for (const item of items) {
                            await client.query(
                                `INSERT INTO order_items 
                                 (order_id, product_id, product_title, product_sku, quantity, 
                                  unit_price, total_price, selected_size, selected_color, selected_color_hex, variant_id)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                [
                                    order.id,
                                    item.product_id,
                                    item.title,
                                    item.variant_sku || item.sku,
                                    item.quantity,
                                    item.unit_price,
                                    Number(item.unit_price) * item.quantity,
                                    item.selected_size,
                                    item.selected_color,
                                    item.selected_color_hex,
                                    item.variant_id || null
                                ]
                            );
                        }

                        // Save card token if requested
                        if (shouldSaveCard && result.cardToken) {
                            if (result.cardUserKey) {
                                await client.query(
                                    `UPDATE payment_cards
                                     SET card_user_key = $1
                                     WHERE user_id = $2
                                       AND (card_user_key IS NULL OR card_user_key = '')`,
                                    [result.cardUserKey, user.id]
                                );
                            }

                            const cardMask = result.binNumber && result.lastFourDigits
                                ? `${result.binNumber} **** ${result.lastFourDigits}`
                                : `**** **** **** ${sanitizedCardNumber.slice(-4)}`;

                            await client.query(
                                `INSERT INTO payment_cards 
                                 (user_id, card_holder_name, card_token, card_user_key, card_alias, card_family, card_bank_name, card_mask, is_default)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                                [
                                    user.id,
                                    card_holder_name,
                                    result.cardToken,
                                    result.cardUserKey || null,
                                    result.cardAssociation || `Card ending in ${sanitizedCardNumber.slice(-4)}`,
                                    result.cardFamily || 'Unknown',
                                    resolvedCardBankName,
                                    cardMask,
                                    false
                                ]
                            );
                        }

                        // Clear cart
                        await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
                        await client.query("UPDATE carts SET status = 'completed' WHERE id = $1", [cart.id]);
                        await client.query('COMMIT');

                        resolve(NextResponse.json(
                            {
                                message: "Order placed successfully",
                                order: responseOrder,
                                pricing: {
                                subtotal,
                                discount_amount: discountAmount,
                                discounted_subtotal: discountedSubtotal,
                                shipping_cost: shippingCost,
                                total_amount: totalAmount,
                                campaign_code: campaign?.code || null,
                                campaign_used_count: updatedCampaignUsage?.used_count ?? campaign?.used_count ?? null,
                                campaign_usage_limit: updatedCampaignUsage?.usage_limit ?? campaign?.usage_limit ?? null,
                            },
                            payment: {
                                paymentId: result.paymentId,
                                status: result.status
                                }
                            },
                            { status: 200 }
                        ));
                    } catch (dbError) {
                        await client.query('ROLLBACK');
                        throw dbError;
                    } finally {
                        client.release();
                    }
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
