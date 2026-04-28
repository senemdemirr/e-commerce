"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { Button, Chip, CircularProgress, Paper, TextField } from "@mui/material";
import { formatCurrency } from "@/lib/admin/order-display";

function formatCampaignBenefit(campaign) {
    if (!campaign) {
        return "";
    }

    const value = Number(campaign.discount_value || 0);

    if (campaign.discount_type === "percent") {
        return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}% off`;
    }

    return `${formatCurrency(value)} off`;
}

export default function OrderSummaryCard({
    cartItems,
    cartSummary,
    campaignCode,
    campaignError,
    campaignLoading,
    appliedCampaign,
    agreedToTerms,
    setAgreedToTerms,
    processing,
    onSubmitOrder,
    onCampaignCodeChange,
    onApplyCampaign,
    onClearCampaign,
}) {
    return (
        <Paper className="!overflow-hidden !rounded-[32px] !border !border-primary/10 !bg-white !p-6 !shadow-sm dark:!border-white/5 dark:!bg-surface-dark">
            <div className="mb-6">
                <h2 className="text-xl font-bold leading-tight text-text-main dark:text-white">
                    Order Summary
                </h2>
                <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                    Apply a campaign code before you place the order.
                </p>
            </div>

            <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400">
                    Campaign Code
                </label>
                <div className="flex gap-2">
                    <TextField
                        fullWidth
                        size="small"
                        value={campaignCode}
                        onChange={(event) => onCampaignCodeChange(event.target.value)}
                        placeholder="Enter code"
                        disabled={processing || campaignLoading}
                        error={Boolean(campaignError)}
                        helperText={campaignError || " "}
                        inputProps={{
                            autoComplete: "off",
                            spellCheck: "false",
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "1rem",
                                backgroundColor: "#f8f9fa",
                                "& fieldset": {
                                    borderColor: "#e5e7eb",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#8dc8a1",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#8dc8a1",
                                },
                            },
                            "& .MuiInputBase-input": {
                                paddingTop: "13px",
                                paddingBottom: "13px",
                            },
                            "& .MuiFormHelperText-root": {
                                marginLeft: 0,
                            },
                        }}
                    />

                    <Button
                        type="button"
                        onClick={onApplyCampaign}
                        disabled={processing || campaignLoading || !campaignCode.trim()}
                        variant="contained"
                        disableElevation
                        className="!min-w-[92px] !rounded-xl !bg-text-main !text-sm !font-bold !normal-case !text-white hover:!bg-text-main/90 disabled:!cursor-not-allowed disabled:!opacity-50 dark:!bg-white dark:!text-text-main dark:hover:!bg-white/90"
                    >
                        {campaignLoading ? "Applying..." : "Apply"}
                    </Button>
                </div>
            </div>

            {appliedCampaign ? (
                <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                                <CheckCircleOutlineIcon />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-main dark:text-white">
                                    Campaign applied
                                </p>
                                <p className="mt-1 text-xs text-text-muted dark:text-gray-400">
                                    {appliedCampaign.title}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-accent">
                                    {formatCampaignBenefit(appliedCampaign)}
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={onClearCampaign}
                            disabled={processing || campaignLoading}
                            variant="text"
                            className="!min-w-0 !rounded-lg !px-3 !py-1.5 !text-xs !font-bold !normal-case !text-text-muted hover:!bg-white/80 dark:!text-gray-300"
                        >
                            Clear
                        </Button>
                    </div>

                    <Chip
                        label={appliedCampaign.code}
                        className="!mt-3 !rounded-full !bg-white !font-mono !font-bold !text-text-main dark:!bg-surface-dark dark:!text-white"
                    />
                </div>
            ) : null}

            <div className="mb-6 flex flex-col gap-3 border-b border-dashed border-gray-200 pb-6 dark:border-gray-700">
                <div className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                    <span>Subtotal ({cartItems.length} Items)</span>
                    <span className="font-medium text-text-main dark:text-white">
                        {formatCurrency(cartSummary.subtotal)}
                    </span>
                </div>
                <div className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                    <span>Discounts</span>
                    <span className="font-medium text-accent">
                        -{formatCurrency(cartSummary.discount)}
                    </span>
                </div>
                <div className="flex justify-between text-sm text-text-muted dark:text-gray-400">
                    <span>Shipping</span>
                    <span className={`font-medium ${cartSummary.shipping === 0 ? "text-primary" : "text-text-main dark:text-white"}`}>
                        {cartSummary.shipping === 0 ? "Free" : formatCurrency(cartSummary.shipping)}
                    </span>
                </div>
            </div>

            <div className="mb-8 flex items-end justify-between">
                <span className="text-lg font-bold text-text-main dark:text-white">
                    Total
                </span>
                <span className="text-2xl font-black tracking-tight text-text-main dark:text-white">
                    {formatCurrency(cartSummary.total)}
                </span>
            </div>

            <Button
                type="button"
                onClick={onSubmitOrder}
                disabled={processing || !agreedToTerms}
                variant="contained"
                disableElevation
                endIcon={processing ? null : <ArrowForwardIcon className="transition-transform group-hover:translate-x-1" />}
                className="group flex w-full items-center justify-center gap-2 !rounded-xl !bg-primary !py-4 !text-base !font-bold !normal-case !text-white !shadow-lg !shadow-primary/25 hover:!bg-primary-dark hover:!shadow-xl hover:!shadow-primary/30 disabled:!cursor-not-allowed disabled:!opacity-50"
            >
                {processing ? (
                    <span className="flex items-center gap-2">
                        <CircularProgress size={18} className="!text-white" />
                        Processing...
                    </span>
                ) : (
                    "Complete Order"
                )}
            </Button>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                <input
                    className="checkbox-transparent-primary !w-6 !h-5"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(event) => setAgreedToTerms(event.target.checked)}
                />
                <span>
                    <a
                        className="underline"
                        href="/pre-information-conditions"
                        target="_blank"
                    >
                        Pre-Information Conditions
                    </a>{" "}
                    and{" "}
                    <a
                        className="underline"
                        href="/distance-sales-agreement"
                        target="_blank"
                    >
                        Distance Sales Agreement
                    </a>
                    , I have read and approve.
                </span>
            </div>

            <div className="mt-8 flex justify-center gap-4 text-gray-400 dark:text-gray-600">
                <div className="flex flex-col items-center gap-1">
                    <LockIcon className="text-xl" fontSize="small" />
                    <span className="text-[10px] font-medium">Secure Payment</span>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col items-center gap-1">
                    <HistoryIcon className="text-xl" fontSize="small" />
                    <span className="text-[10px] font-medium">30-Day Return</span>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col items-center gap-1">
                    <SupportAgentIcon className="text-xl" fontSize="small" />
                    <span className="text-[10px] font-medium">24/7 Support</span>
                </div>
            </div>
        </Paper>
    );
}
