"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useCart } from "@/context/CartContext";
import NewAdresForm from "@/app/(site)/my-profile/components/UserAdresses/NewAdresForm";
import { useSnackbar } from "notistack";
import AddressCard from "./components/AddressCard";
import PaymentCard from "./components/PaymentCard";
import OrderSummaryCard from "./components/OrderSummaryCard";

export default function CheckoutPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const { fetchCart } = useCart();

    // Data states
    const [addresses, setAddresses] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [cartSummary, setCartSummary] = useState({ subtotal: 0, shipping: 0, total: 0 });

    // Form states
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [cardHolderName, setCardHolderName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expireMonth, setExpireMonth] = useState("");
    const [expireYear, setExpireYear] = useState("");
    const [cvc, setCvc] = useState("");
    const [saveCard, setSaveCard] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Address dialog
    const [openAddressDialog, setOpenAddressDialog] = useState(false);

    const calculateSummary = useCallback((items) => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const shipping = subtotal >= 1000 ? 0 : 49.90;
        const total = subtotal + shipping;
        setCartSummary({ subtotal, shipping, total });
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch addresses from the correct endpoint
            const addressRes = await apiFetch("/api/my-profile/my-addresses");
            if (addressRes && Array.isArray(addressRes)) {
                setAddresses(addressRes);
                // Auto-select first address
                if (addressRes.length > 0) {
                    setSelectedAddressId(addressRes[0].id);
                }
            }

            // Fetch cart
            const cartRes = await apiFetch("/api/cart");
            if (cartRes.items) {
                setCartItems(cartRes.items);
                calculateSummary(cartRes.items);
            }
        } catch (err) {
            if (err?.status === 401) {
                enqueueSnackbar("Please sign in to continue checkout.", { variant: "warning" });
                router.push("/auth/login");
                return;
            }
            console.error("Error fetching data:", err);
            enqueueSnackbar("Failed to load cart and address information. Please try again.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }, [calculateSummary, enqueueSnackbar, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddressSuccess = () => {
        setOpenAddressDialog(false);
        fetchData(); // Refresh addresses
    };

    const handleSubmitOrder = async () => {
        // Validation
        if (!selectedAddressId) {
            enqueueSnackbar("Please select a delivery address.", { variant: "warning" });
            return;
        }
        if (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc) {
            enqueueSnackbar("Please fill in all payment details.", { variant: "warning" });
            return;
        }
        if (!agreedToTerms) {
            enqueueSnackbar("Please agree to the terms and conditions.", { variant: "warning" });
            return;
        }

        try {
            setProcessing(true);

            const checkoutData = {
                shipping_address_id: selectedAddressId,
                card_holder_name: cardHolderName,
                card_number: cardNumber.replace(/\s/g, ''),
                expire_month: expireMonth,
                expire_year: expireYear,
                cvc: cvc,
                save_card: saveCard,
            };

            const res = await apiFetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify(checkoutData),
            });

            if (res.order) {
                const { order_number, total_amount, subtotal, shipping_cost } = res.order;
                fetchCart(); // Clear cart in context
                router.push(`/checkout/success?orderNumber=${order_number}&total=${total_amount}&subtotal=${subtotal}&shipping=${shipping_cost}`);
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
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-6 md:py-8">
            {/* Page Heading */}
            <div className="mb-8">
                <h1 className="text-text-dark dark:text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] md:tracking-[-0.033em]">
                    Checkout
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
                    Complete your order securely and quickly.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-8">
                    <AddressCard
                        addresses={addresses}
                        selectedAddressId={selectedAddressId}
                        onAddressSelect={setSelectedAddressId}
                        onAddAddress={() => setOpenAddressDialog(true)}
                    />
                    <PaymentCard
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

                <div className="w-full lg:w-[380px]">
                    <OrderSummaryCard
                        cartItems={cartItems}
                        cartSummary={cartSummary}
                        agreedToTerms={agreedToTerms}
                        setAgreedToTerms={setAgreedToTerms}
                        processing={processing}
                        onSubmitOrder={handleSubmitOrder}
                    />
                </div>
            </div>

            {/* Add Address Dialog */}
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
