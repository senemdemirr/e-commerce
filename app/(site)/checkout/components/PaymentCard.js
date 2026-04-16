"use client";

import { useEffect, useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function PaymentCard({
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDatePicker && !event.target.closest(".date-picker-container")) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDatePicker]);

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

    const { months, years } = generateMonthsAndYears();

    return (
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
                        onChange={(event) => setCardHolderName(event.target.value.toUpperCase())}
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
                                value={expireMonth && expireYear ? `${expireMonth} / ${expireYear}` : ""}
                                onClick={() => setShowDatePicker((current) => !current)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
                                <CalendarTodayIcon fontSize="small" />
                            </div>
                        </div>

                        {showDatePicker && (
                            <div className="absolute top-full left-0 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden w-[min(18rem,calc(100vw-2rem))]">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                                        Select Expiration
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowDatePicker(false)}
                                        className="text-gray-400 hover:text-gray-600 px-2 text-xl"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="flex h-64">
                                    <div className="flex-1 overflow-y-auto border-r border-gray-100 dark:border-gray-800 scrollbar-hide">
                                        <div className="p-2 text-[10px] font-bold text-gray-400 text-center uppercase bg-gray-50/50 dark:bg-gray-900/50">
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
                                                            ? "opacity-20 cursor-not-allowed"
                                                            : expireMonth === month.value
                                                              ? "bg-primary text-white"
                                                              : "hover:bg-primary/10 text-gray-700 dark:text-gray-300"
                                                    }`}
                                                >
                                                    {month.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                                        <div className="p-2 text-[10px] font-bold text-gray-400 text-center uppercase bg-gray-50/50 dark:bg-gray-900/50">
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
                                                        : "hover:bg-primary/10 text-gray-700 dark:text-gray-300"
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
                                onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").substring(0, 3))}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCvv((current) => !current)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    <input
                        className="checkbox-transparent-primary"
                        id="save_card"
                        type="checkbox"
                        checked={saveCard}
                        onChange={(event) => setSaveCard(event.target.checked)}
                    />
                    <label className="text-sm text-gray-600 dark:text-gray-400" htmlFor="save_card">
                        Save card information securely for future purchases.
                    </label>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-50 grayscale hover:grayscale-0 transition-all text-center">
                <div className="flex items-center gap-1">
                    <LockIcon fontSize="small" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        256-bit SSL
                    </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    Secured by Iyzico
                </span>
            </div>
        </div>
    );
}
