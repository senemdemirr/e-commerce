"use client";

import { useEffect, useState } from "react";
import { Checkbox, Collapse } from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function PaymentCard({
    savedCards = [],
    cardHolderName,
    setCardHolderName,
    cardNumber,
    setCardNumber,
    expireMonth,
    setExpireMonth,
    expireYear,
    setExpireYear,
    cvc,
    setCvc,
    saveCard,
    setSaveCard,
}) {
    const [showCvv, setShowCvv] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isManualFormOpen, setIsManualFormOpen] = useState(savedCards.length === 0);
    const [selectedSavedCardId, setSelectedSavedCardId] = useState(
        savedCards.find((card) => card.is_default)?.id ?? savedCards[0]?.id ?? null
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDatePicker && !event.target.closest(".date-picker-container")) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDatePicker]);

    useEffect(() => {
        setSelectedSavedCardId(
            savedCards.find((card) => card.is_default)?.id ?? savedCards[0]?.id ?? null
        );

        if (savedCards.length === 0) {
            setIsManualFormOpen(true);
        }
    }, [savedCards]);

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted.substring(0, 19);
    };

    const generateMonthsAndYears = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const currentYearShort = currentYear % 100;

        const months = [];
        const years = [];

        for (let i = 0; i <= 20; i += 1) {
            years.push({
                value: (currentYearShort + i) % 100,
                label: String((currentYearShort + i) % 100).padStart(2, "0"),
                fullYear: currentYear + i,
            });
        }

        for (let i = 1; i <= 12; i += 1) {
            months.push({
                value: String(i).padStart(2, "0"),
                label: String(i).padStart(2, "0"),
            });
        }

        return { months, years, currentMonth, currentYearShort };
    };

    const isDateDisabled = (month, year) => {
        const { currentMonth, currentYearShort } = generateMonthsAndYears();
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        if (yearNum < currentYearShort) return true;
        if (yearNum === currentYearShort && monthNum < currentMonth) return true;
        return false;
    };

    const handleCardNumberChange = (event) => {
        setCardNumber(formatCardNumber(event.target.value));
    };

    const getCardBrandLabel = (savedCard) => {
        const label = savedCard.card_family || savedCard.card_alias || "Card";
        return String(label).trim().toUpperCase();
    };

    const getMaskedCardNumber = (savedCard) => {
        const match = String(savedCard.card_alias || "").match(/(\d{4})\s*$/);
        const lastFour = match?.[1] || "****";
        return `**** **** **** ${lastFour}`;
    };

    const { months, years } = generateMonthsAndYears();

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold leading-tight text-primary">
                    <span className="rounded-lg bg-primary/10 p-2">
                        <CreditCardIcon className="text-primary" />
                    </span>
                    2. Payment Method
                </h2>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4">
                <InfoOutlinedIcon className="mt-0.5 text-accent" fontSize="small" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Interest-free <span className="font-bold text-text-dark dark:text-white">3-installment</span> option for Halkbank and Is Bank cards.
                </p>
            </div>

            <div className="mb-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h3 className="text-md font-bold text-text-dark dark:text-white">
                            My Saved Cards
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Scroll horizontally to browse your saved cards.
                        </p>
                    </div>
                    <span className="w-fit rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:border-gray-700">
                        {savedCards.length} Total
                    </span>
                </div>

                <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-950/40">
                    <div className="scrollbar-hide overflow-x-auto overflow-y-hidden pb-2">
                        <div className="flex min-w-max gap-3">
                            {savedCards.map((savedCard) => {
                                const isSelected = selectedSavedCardId === savedCard.id;

                                return (
                                    <button
                                        type="button"
                                        key={savedCard.id}
                                        onClick={() => setSelectedSavedCardId(savedCard.id)}
                                        className={`group relative w-[280px] shrink-0 rounded-xl p-5 text-left transition-all ${
                                            isSelected
                                                ? "border-2 border-primary bg-white shadow-sm shadow-primary/10 dark:bg-surface-dark"
                                                : "border border-gray-200 bg-white hover:border-primary/50 dark:border-gray-800 dark:bg-surface-dark/80"
                                        }`}
                                    >
                                        <div className="mb-8 flex items-start justify-between gap-4">
                                            <div className="flex flex-col">
                                                <p className={`mb-1 text-xs font-bold uppercase tracking-[0.2em] ${isSelected ? "text-primary" : "text-gray-400"}`}>
                                                    {savedCard.card_alias || "Saved Card"}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    {isSelected && (
                                                        <CheckCircleIcon className="text-primary" fontSize="small" />
                                                    )}
                                                    <p className="font-bold text-text-dark dark:text-white">
                                                        {savedCard.card_bank_name || "Bank Name"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                                                isSelected
                                                    ? "border-primary/30 bg-primary/10 text-primary"
                                                    : "border-gray-200 text-gray-400 transition-colors group-hover:border-primary/30 group-hover:text-primary dark:border-gray-700"
                                            }`}>
                                                {getCardBrandLabel(savedCard)}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className={`font-mono text-lg tracking-[0.2em] ${isSelected ? "text-text-dark dark:text-white" : "text-gray-400 group-hover:text-text-dark dark:group-hover:text-white"}`}>
                                                {getMaskedCardNumber(savedCard)}
                                            </p>
                                            <div className="flex items-end justify-between gap-4">
                                                <p className="text-xs uppercase text-gray-500">
                                                    {savedCard.card_holder_name || "Card Holder"}
                                                </p>
                                                <p className="text-xs font-bold text-gray-400">
                                                    {savedCard.is_default ? "Default" : "Stored"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => setIsManualFormOpen(true)}
                                className="group flex h-[170px] w-[140px] shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-4 transition-colors hover:bg-white dark:border-gray-700 dark:hover:bg-gray-800/50"
                            >
                                <AddCircleOutlineIcon className="mb-2 text-gray-400 transition-colors group-hover:text-primary" />
                                <span className="text-center text-[10px] font-bold uppercase text-gray-400">
                                    Add Card
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => setIsManualFormOpen((current) => !current)}
                    className="flex w-full items-center justify-between text-sm font-bold text-gray-500 transition-colors hover:text-primary"
                >
                    <span className="flex items-center gap-2">
                        <AddCardIcon fontSize="small" />
                        Pay With Another Card
                    </span>
                    <ExpandMoreIcon
                        className={`transition-transform ${isManualFormOpen ? "rotate-180" : ""}`}
                        fontSize="small"
                    />
                </button>

                <Collapse in={isManualFormOpen} timeout={250}>
                    <form className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Name on Card
                                </label>
                                <input
                                    className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                    placeholder="JOHN DOE"
                                    type="text"
                                    value={cardHolderName}
                                    onChange={(event) => setCardHolderName(event.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="0000 0000 0000 0000"
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                                        <CreditCardIcon fontSize="small" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="date-picker-container relative flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Expiry Date
                                </label>
                                <div className="relative">
                                    <input
                                        className="h-12 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="MM / YY"
                                        type="text"
                                        readOnly
                                        value={expireMonth && expireYear ? `${expireMonth} / ${expireYear}` : ""}
                                        onClick={() => setShowDatePicker((current) => !current)}
                                    />
                                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                                        <CalendarTodayIcon fontSize="small" />
                                    </div>
                                </div>

                                {showDatePicker && (
                                    <div className="absolute left-0 top-full z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-surface-dark">
                                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                                Select Expiration
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setShowDatePicker(false)}
                                                className="px-2 text-xl text-gray-400 hover:text-gray-600"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="flex h-64">
                                            <div className="scrollbar-hide flex-1 overflow-y-auto border-r border-gray-100 dark:border-gray-800">
                                                <div className="bg-gray-50/50 p-2 text-center text-[10px] font-bold uppercase text-gray-400 dark:bg-gray-900/50">
                                                    Month
                                                </div>
                                                {months.map((month) => {
                                                    const disabled = expireYear
                                                        ? isDateDisabled(month.value, expireYear)
                                                        : false;

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={month.value}
                                                            disabled={disabled}
                                                            onClick={() => setExpireMonth(month.value)}
                                                            className={`w-full py-3 text-sm font-medium transition-colors ${
                                                                disabled
                                                                    ? "cursor-not-allowed opacity-20"
                                                                    : expireMonth === month.value
                                                                        ? "bg-primary text-white"
                                                                        : "text-gray-700 hover:bg-primary/10 dark:text-gray-300"
                                                            }`}
                                                        >
                                                            {month.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="scrollbar-hide flex-1 overflow-y-auto">
                                                <div className="bg-gray-50/50 p-2 text-center text-[10px] font-bold uppercase text-gray-400 dark:bg-gray-900/50">
                                                    Year
                                                </div>
                                                {years.map((year) => (
                                                    <button
                                                        type="button"
                                                        key={year.fullYear}
                                                        onClick={() => {
                                                            setExpireYear(year.label);
                                                            if (expireMonth && isDateDisabled(expireMonth, year.label)) {
                                                                setExpireMonth("");
                                                            }
                                                        }}
                                                        className={`w-full py-3 text-sm font-medium transition-colors ${
                                                            expireYear === year.label
                                                                ? "bg-primary text-white"
                                                                : "text-gray-700 hover:bg-primary/10 dark:text-gray-300"
                                                        }`}
                                                    >
                                                        {year.fullYear}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {expireMonth && expireYear && (
                                            <button
                                                type="button"
                                                onClick={() => setShowDatePicker(false)}
                                                className="w-full bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
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
                                        className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 pr-12 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="***"
                                        type={showCvv ? "text" : "password"}
                                        value={cvc}
                                        onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").substring(0, 3))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCvv((current) => !current)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                                    >
                                        {showCvv ? (
                                            <VisibilityOffIcon fontSize="small" />
                                        ) : (
                                            <VisibilityIcon fontSize="small" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                id="save_card"
                                checked={saveCard}
                                onChange={(event) => setSaveCard(event.target.checked)}
                                sx={{
                                    color: "#9ca3af",
                                    "&.Mui-checked": { color: "#8dc8a1" },
                                    padding: 0,
                                    marginRight: "0.25rem",
                                }}
                            />
                            <label className="text-sm text-gray-600 dark:text-gray-400" htmlFor="save_card">
                                Save this card securely for future purchases.
                            </label>
                        </div>
                    </form>
                </Collapse>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 pt-6 text-center opacity-60 transition-all hover:opacity-100 dark:border-gray-800 sm:gap-6">
                <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:border-gray-700 dark:text-gray-300">
                    Visa
                </span>
                <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:border-gray-700 dark:text-gray-300">
                    Mastercard
                </span>
                <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:border-gray-700 dark:text-gray-300">
                    Iyzico
                </span>
                <div className="flex items-center gap-1">
                    <LockIcon fontSize="small" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        256-bit SSL
                    </span>
                </div>
            </div>
        </div>
    );
}
