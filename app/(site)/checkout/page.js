"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useCart } from "@/context/CartContext";
import NewAdresForm from "@/app/(site)/my-profile/components/UserAdresses/NewAdresForm";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useSnackbar } from "notistack";

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

    // UI states
    const [showCvv, setShowCvv] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Address dialog
    const [openAddressDialog, setOpenAddressDialog] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDatePicker && !event.target.closest('.date-picker-container')) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDatePicker]);

    const fetchData = async () => {
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
    };

    const calculateSummary = (items) => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
        const shipping = subtotal >= 1000 ? 0 : 49.90;
        const total = subtotal + shipping;
        setCartSummary({ subtotal, shipping, total });
    };

    const handleAddressSuccess = () => {
        setOpenAddressDialog(false);
        fetchData(); // Refresh addresses
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19);
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    // Generate available months and years for date picker
    const generateMonthsAndYears = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentYear = currentDate.getFullYear();
        const currentYearShort = currentYear % 100; // Last 2 digits

        const months = [];
        const years = [];

        // Generate years (current year + next 20 years)
        for (let i = 0; i <= 20; i++) {
            years.push({
                value: (currentYearShort + i) % 100,
                label: String((currentYearShort + i) % 100).padStart(2, '0'),
                fullYear: currentYear + i
            });
        }

        // Generate months (1-12)
        for (let i = 1; i <= 12; i++) {
            months.push({
                value: String(i).padStart(2, '0'),
                label: String(i).padStart(2, '0')
            });
        }

        return { months, years, currentMonth, currentYearShort };
    };


    const isDateDisabled = (month, year) => {
        const { currentMonth, currentYearShort } = generateMonthsAndYears();
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        if (yearNum < currentYearShort) return true;
        if (yearNum === currentYearShort && monthNum < currentMonth) return true;
        return false;
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
                {/* Left Column: Checkout Forms */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Section 1: Delivery Address */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                            <h2 className="text-primary text-xl font-bold leading-tight flex items-center gap-2">
                                <span className="bg-primary/10 p-2 rounded-lg">
                                    <LocationOnIcon className="text-primary" />
                                </span>
                                1. Delivery Address
                            </h2>
                            <button
                                onClick={() => setOpenAddressDialog(true)}
                                className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
                            >
                                <AddIcon fontSize="small" />
                                Add New Address
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    onClick={() => setSelectedAddressId(address.id)}
                                    className={`relative border-2 p-4 rounded-xl cursor-pointer transition-all ${selectedAddressId === address.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-800 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {address.address_title?.toLowerCase().includes('home') ?
                                                <HomeIcon fontSize="small" className="text-text-muted" /> :
                                                <WorkIcon fontSize="small" className="text-text-muted" />
                                            }
                                            <p className="text-text-dark dark:text-white font-bold">
                                                {address.address_title}
                                            </p>
                                        </div>
                                        {selectedAddressId === address.id && (
                                            <CheckCircleIcon className="text-primary" />
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {address.recipient_first_name} {address.recipient_last_name}
                                        <br />
                                        {address.address_line}
                                        <br />
                                        {address.neighborhood_name}, {address.district_name}, {address.city_name}
                                    </p>
                                    <p className="mt-3 text-xs font-bold text-gray-400">
                                        {address.recipient_phone}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Payment Method */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-primary text-xl font-bold leading-tight flex items-center gap-2">
                                <span className="bg-primary/10 p-2 rounded-lg">
                                    <CreditCardIcon className="text-primary" />
                                </span>
                                2. Payment Method
                            </h2>
                        </div>

                        <form className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Cardholder Name
                                </label>
                                <input
                                    className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="JOHN DOE"
                                    type="text"
                                    value={cardHolderName}
                                    onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="0000 0000 0000 0000"
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                                        <CreditCardIcon />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2 relative date-picker-container">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Expiry Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                                            placeholder="MM / YY"
                                            type="text"
                                            readOnly
                                            value={expireMonth && expireYear ? `${expireMonth} / ${expireYear}` : ''}
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
                                            <CalendarTodayIcon fontSize="small" />
                                        </div>
                                    </div>

                                    {/* Advanced Date Picker Box */}
                                    {showDatePicker && (
                                        <div className="absolute top-full left-0 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden w-[min(18rem,calc(100vw-2rem))]">
                                            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Select Expiration</h4>
                                                <button type="button" onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-gray-600 px-2 text-xl">&times;</button>
                                            </div>
                                            <div className="flex h-64">
                                                {/* Months Column */}
                                                <div className="flex-1 overflow-y-auto border-r border-gray-100 dark:border-gray-800 scrollbar-hide">
                                                    <div className="p-2 text-[10px] font-bold text-gray-400 text-center uppercase bg-gray-50/50 dark:bg-gray-900/50">Month</div>
                                                    {(() => {
                                                        const { months } = generateMonthsAndYears();
                                                        return months.map(m => {
                                                            const disabled = expireYear ? isDateDisabled(m.value, expireYear) : false;
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={m.value}
                                                                    disabled={disabled}
                                                                    onClick={() => setExpireMonth(m.value)}
                                                                    className={`w-full py-3 text-sm font-medium transition-colors ${disabled ? 'opacity-20 cursor-not-allowed' :
                                                                        expireMonth === m.value ? 'bg-primary text-white' : 'hover:bg-primary/10 text-gray-700 dark:text-gray-300'
                                                                        }`}
                                                                >
                                                                    {m.label}
                                                                </button>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                                {/* Years Column */}
                                                <div className="flex-1 overflow-y-auto scrollbar-hide">
                                                    <div className="p-2 text-[10px] font-bold text-gray-400 text-center uppercase bg-gray-50/50 dark:bg-gray-900/50">Year</div>
                                                    {(() => {
                                                        const { years } = generateMonthsAndYears();
                                                        return years.map(y => (
                                                            <button
                                                                type="button"
                                                                key={y.value}
                                                                onClick={() => {
                                                                    setExpireYear(y.label);
                                                                    // If current month is invalid for this year, reset it
                                                                    if (expireMonth && isDateDisabled(expireMonth, y.label)) {
                                                                        setExpireMonth("");
                                                                    }
                                                                }}
                                                                className={`w-full py-3 text-sm font-medium transition-colors ${expireYear === y.label ? 'bg-primary text-white' : 'hover:bg-primary/10 text-gray-700 dark:text-gray-300'
                                                                    }`}
                                                            >
                                                                20{y.label}
                                                            </button>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                            {expireMonth && expireYear && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDatePicker(false)}
                                                    className="w-full py-3 bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors"
                                                >
                                                    Done
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        CVV
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="***"
                                            type={showCvv ? "text" : "password"}
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCvv(!showCvv)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showCvv ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    className="checkbox-transparent-primary"
                                    id="save_card"
                                    type="checkbox"
                                    checked={saveCard}
                                    onChange={(e) => setSaveCard(e.target.checked)}
                                />
                                <label className="text-sm text-gray-600 dark:text-gray-400" htmlFor="save_card">
                                    Save card information securely for future purchases.
                                </label>
                            </div>
                        </form>

                        {/* Trust Badges */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-50 grayscale hover:grayscale-0 transition-all text-center">
                            <div className="flex items-center gap-1">
                                <LockIcon fontSize="small" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">256-bit SSL</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secured by Iyzico</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="w-full lg:w-[380px]">
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                        <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                            Order Summary
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal ({cartItems.length} Items)</span>
                                <span className="font-semibold">{cartSummary.subtotal.toFixed(2)} TL</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className={`font-bold ${cartSummary.shipping === 0 ? 'text-primary' : ''}`}>
                                    {cartSummary.shipping === 0 ? 'Free' : `${cartSummary.shipping.toFixed(2)} TL`}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-8">
                            <div className="flex justify-between items-end">
                                <span className="text-base font-bold">Total</span>
                                <span className="text-2xl sm:text-3xl font-black text-primary">
                                    {cartSummary.total.toFixed(2)} TL
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitOrder}
                            disabled={processing || !agreedToTerms}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Complete Order
                                    <ArrowForwardIcon className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-start gap-2 text-[11px] text-gray-400">
                                <input
                                    className="checkbox-transparent-primary !w-6 !h-5"
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                />
                                <span>
                                    <a className="underline" href="/pre-information-conditions" target="_blank">Pre-Information Conditions</a> and{' '}
                                    <a className="underline" href="/distance-sales-agreement" target="_blank">Distance Sales Agreement</a>, I have read and approve.
                                </span>
                            </div>
                        </div>

                        {/* Mini Cart Items Preview */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Items in Cart
                            </p>
                            <div className="space-y-4">
                                {cartItems.slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div
                                            className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg bg-cover bg-center"
                                            style={{ backgroundImage: `url('${item.image}')` }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                                            <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
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
