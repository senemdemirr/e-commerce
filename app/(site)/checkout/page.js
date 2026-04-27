"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import NewAdresForm from "@/app/(site)/my-profile/components/UserAdresses/NewAdresForm";
import { useSnackbar } from "notistack";
import { calculateCampaignDiscountAmount, roundMoney } from "@/lib/admin/campaigns";
import AddressCard from "./components/AddressCard";
import PaymentCard from "./components/PaymentCard";
import OrderSummaryCard from "./components/OrderSummaryCard";

export default function CheckoutPage() {
    const router = useRouter();
    const user = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const { items: cartItems, fetchCart, isCartReady } = useCart();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [savedCards, setSavedCards] = useState([]);
    const [cartSummary, setCartSummary] = useState({ subtotal: 0, shipping: 0, discount: 0, total: 0 });

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedSavedCardId, setSelectedSavedCardId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [cardHolderName, setCardHolderName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expireMonth, setExpireMonth] = useState("");
    const [expireYear, setExpireYear] = useState("");
    const [cvc, setCvc] = useState("");
    const [saveCard, setSaveCard] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [campaignCode, setCampaignCode] = useState("");
    const [appliedCampaign, setAppliedCampaign] = useState(null);
    const [campaignLoading, setCampaignLoading] = useState(false);
    const [campaignError, setCampaignError] = useState("");

    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const previousSavedCardsCountRef = useRef(0);
    const hasFetchedCheckoutDataRef = useRef(false);
    const hasRedirectedToLoginRef = useRef(false);
    const hasRedirectedToBasketRef = useRef(false);
    const [accessState, setAccessState] = useState("checking");

    const normalizeCampaignCodeInput = useCallback((value) => (
        String(value || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "")
    ), []);

    const calculateSummary = useCallback((items, campaign = null) => {
        const subtotal = roundMoney(items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0));
        const shipping = subtotal >= 1000 ? 0 : 49.90;
        const discount = campaign ? calculateCampaignDiscountAmount(campaign, subtotal) : 0;
        const total = roundMoney(Math.max(0, subtotal - discount + shipping));
        setCartSummary({ subtotal, shipping, discount, total });
    }, []);

    const resolveCampaignByCode = useCallback(async (value) => {
        const normalizedCode = normalizeCampaignCodeInput(value);

        if (!normalizedCode) {
            throw new Error("Please enter a campaign code.");
        }

        const campaigns = await apiFetch("/api/campaigns");
        const matchedCampaign = Array.isArray(campaigns)
            ? campaigns.filter(Boolean).find((campaign) => campaign.code === normalizedCode)
            : null;

        if (!matchedCampaign) {
            throw new Error("Campaign code is invalid or expired.");
        }

        return matchedCampaign;
    }, [normalizeCampaignCodeInput]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [addressRes, savedCardsRes] = await Promise.all([
                apiFetch("/api/my-profile/my-addresses"),
                apiFetch("/api/payment-cards"),
            ]);

            if (addressRes && Array.isArray(addressRes)) {
                setAddresses(addressRes);
                setSelectedAddressId((current) => (
                    addressRes.some((address) => address.id === current) ? current : (addressRes[0]?.id ?? null)
                ));
            }

            setSavedCards(Array.isArray(savedCardsRes?.cards) ? savedCardsRes.cards : []);
        } catch (err) {
            if (err?.status === 401) {
                enqueueSnackbar("Please sign in to continue checkout.", { variant: "warning" });
                router.replace("/auth/login");
                return;
            }
            console.error("Error fetching data:", err);
            enqueueSnackbar("Failed to load checkout information. Please try again.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar, router]);

    useEffect(() => {
        calculateSummary(cartItems, appliedCampaign);
    }, [appliedCampaign, calculateSummary, cartItems]);

    useLayoutEffect(() => {
        if (!isCartReady) {
            return;
        }

        if (!user) {
            setLoading(false);
            setAccessState("redirecting");
            if (!hasRedirectedToLoginRef.current) {
                hasRedirectedToLoginRef.current = true;
                enqueueSnackbar("Please sign in to continue checkout.", { variant: "warning" });
                router.replace("/auth/login");
            }
            return;
        }

        if (cartItems.length === 0) {
            setLoading(false);
            setAccessState("redirecting");
            if (!hasRedirectedToBasketRef.current) {
                hasRedirectedToBasketRef.current = true;
                enqueueSnackbar("Your basket is empty.", { variant: "info" });
                router.replace("/basket");
            }
            return;
        }

        hasRedirectedToLoginRef.current = false;
        hasRedirectedToBasketRef.current = false;
        setAccessState("allowed");

        if (!hasFetchedCheckoutDataRef.current) {
            hasFetchedCheckoutDataRef.current = true;
            fetchData();
        }
    }, [cartItems.length, enqueueSnackbar, fetchData, isCartReady, router, user]);

    useEffect(() => {
        const sortCardsByLatest = (cards) => [...cards].sort((leftCard, rightCard) => Number(rightCard.id) - Number(leftCard.id));
        const latestSavedCardId = sortCardsByLatest(savedCards)[0]?.id ?? null;
        const defaultSavedCardId = latestSavedCardId ?? null;
        const hadNoSavedCardsBefore = previousSavedCardsCountRef.current === 0;

        setSelectedSavedCardId((current) => (
            savedCards.some((card) => card.id === current) ? current : defaultSavedCardId
        ));

        setPaymentMethod((current) => {
            if (savedCards.length === 0) {
                return "manual";
            }

            if (current === "manual" && hadNoSavedCardsBefore) {
                return "saved";
            }

            return current ?? "saved";
        });

        previousSavedCardsCountRef.current = savedCards.length;
    }, [savedCards]);

    const handleAddressSuccess = () => {
        setOpenAddressDialog(false);
        fetchData();
    };

    const handleCampaignCodeChange = (value) => {
        const normalizedValue = normalizeCampaignCodeInput(value);
        setCampaignCode(normalizedValue);
        setCampaignError("");

        if (appliedCampaign && normalizedValue !== appliedCampaign.code) {
            setAppliedCampaign(null);
        }
    };

    const handleApplyCampaign = async () => {
        try {
            setCampaignLoading(true);
            const campaign = await resolveCampaignByCode(campaignCode);
            setAppliedCampaign(campaign);
            setCampaignCode(campaign.code);
            setCampaignError("");
            calculateSummary(cartItems, campaign);
            enqueueSnackbar(`Campaign ${campaign.code} applied.`, { variant: "success" });
        } catch (err) {
            setAppliedCampaign(null);
            setCampaignError(err.message || "Campaign code is invalid or expired.");
            enqueueSnackbar(err.message || "Campaign code is invalid or expired.", { variant: "error" });
        } finally {
            setCampaignLoading(false);
        }
    };

    const handleClearCampaign = () => {
        setCampaignCode("");
        setAppliedCampaign(null);
        setCampaignError("");
        calculateSummary(cartItems, null);
    };

    const handleSubmitOrder = async () => {
        const isUsingSavedCard = paymentMethod === "saved" && Boolean(selectedSavedCardId);

        if (cartItems.length === 0) {
            enqueueSnackbar("Your basket is empty.", { variant: "info" });
            router.replace("/basket");
            return;
        }
        if (!selectedAddressId) {
            enqueueSnackbar("Please select a delivery address.", { variant: "warning" });
            return;
        }
        if (!isUsingSavedCard && (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc)) {
            enqueueSnackbar("Please fill in all payment details.", { variant: "warning" });
            return;
        }
        if (!agreedToTerms) {
            enqueueSnackbar("Please agree to the terms and conditions.", { variant: "warning" });
            return;
        }

        try {
            setProcessing(true);

            let campaignToUse = appliedCampaign;
            const normalizedCampaignCode = normalizeCampaignCodeInput(campaignCode);

            if (normalizedCampaignCode && campaignToUse?.code !== normalizedCampaignCode) {
                try {
                    setCampaignLoading(true);
                    campaignToUse = await resolveCampaignByCode(normalizedCampaignCode);
                    setAppliedCampaign(campaignToUse);
                    setCampaignCode(campaignToUse.code);
                    setCampaignError("");
                    calculateSummary(cartItems, campaignToUse);
                } catch (campaignErr) {
                    setAppliedCampaign(null);
                    setCampaignError(campaignErr.message || "Campaign code is invalid or expired.");
                    enqueueSnackbar(campaignErr.message || "Campaign code is invalid or expired.", { variant: "error" });
                    return;
                } finally {
                    setCampaignLoading(false);
                }
            }

            const checkoutData = {
                shipping_address_id: selectedAddressId,
                campaign_code: campaignToUse?.code || null,
                ...(isUsingSavedCard
                    ? {
                        payment_card_id: selectedSavedCardId,
                    }
                    : {
                        card_holder_name: cardHolderName,
                        card_number: cardNumber.replace(/\s/g, ""),
                        expire_month: expireMonth,
                        expire_year: expireYear,
                        cvc,
                        save_card: saveCard,
                    }),
            };

            const res = await apiFetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify(checkoutData),
            });

            if (res.order) {
                const pricing = res.pricing || {};
                const { order_number } = res.order;
                const successParams = new URLSearchParams({
                    orderNumber: order_number,
                    total: String(pricing.total_amount ?? res.order.total_amount ?? 0),
                    subtotal: String(pricing.subtotal ?? cartSummary.subtotal),
                    shipping: String(pricing.shipping_cost ?? res.order.shipping_cost ?? 0),
                });

                if (Number(pricing.discount_amount || 0) > 0) {
                    successParams.set("discount", String(pricing.discount_amount));
                }

                if (pricing.campaign_code) {
                    successParams.set("campaign", pricing.campaign_code);
                }

                fetchCart();
                router.push(`/checkout/success?${successParams.toString()}`);
            } else {
                enqueueSnackbar(res.message || res.error || "Payment failed. Please try again.", { variant: "error" });
            }
        } catch (err) {
            console.error("Checkout error:", err);
            if (err?.status === 401) {
                enqueueSnackbar("Please sign in to place an order.", { variant: "warning" });
                router.push("/auth/login");
                return;
            }
            enqueueSnackbar(err.message || "An error occurred during checkout.", { variant: "error" });
        } finally {
            setProcessing(false);
            setCampaignLoading(false);
        }
    };

    if (accessState === "redirecting") {
        return null;
    }

    if (!isCartReady || accessState === "checking" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8 lg:py-10">
            <div className="mb-8 max-w-2xl">
                <h1 className="text-text-dark dark:text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] md:tracking-[-0.033em]">
                    Checkout
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
                    Complete your order securely and quickly.
                </p>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-8">
                    <AddressCard
                        addresses={addresses}
                        selectedAddressId={selectedAddressId}
                        onAddressSelect={setSelectedAddressId}
                        onAddAddress={() => setOpenAddressDialog(true)}
                    />
                    <PaymentCard
                        savedCards={savedCards}
                        selectedSavedCardId={selectedSavedCardId}
                        setSelectedSavedCardId={setSelectedSavedCardId}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        cardHolderName={cardHolderName}
                        setCardHolderName={setCardHolderName}
                        cardNumber={cardNumber}
                        setCardNumber={setCardNumber}
                        expireMonth={expireMonth}
                        setExpireMonth={setExpireMonth}
                        expireYear={expireYear}
                        setExpireYear={setExpireYear}
                        cvc={cvc}
                        setCvc={setCvc}
                        saveCard={saveCard}
                        setSaveCard={setSaveCard}
                    />
                </div>

                <div className="w-full self-start xl:sticky xl:top-24">
                    <OrderSummaryCard
                        cartItems={cartItems}
                        cartSummary={cartSummary}
                        campaignCode={campaignCode}
                        campaignError={campaignError}
                        campaignLoading={campaignLoading}
                        appliedCampaign={appliedCampaign}
                        agreedToTerms={agreedToTerms}
                        setAgreedToTerms={setAgreedToTerms}
                        processing={processing}
                        onSubmitOrder={handleSubmitOrder}
                        onCampaignCodeChange={handleCampaignCodeChange}
                        onApplyCampaign={handleApplyCampaign}
                        onClearCampaign={handleClearCampaign}
                    />
                </div>
            </div>

            {openAddressDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl sm:text-2xl font-bold">Add New Address</h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <NewAdresForm
                                mode="create"
                                onSuccess={handleAddressSuccess}
                                onCancel={() => setOpenAddressDialog(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
