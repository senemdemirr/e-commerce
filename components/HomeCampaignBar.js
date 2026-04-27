'use client';

import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import { useSnackbar } from 'notistack';

function formatCampaignDiscount(campaign) {
    const value = Number(campaign?.discount_value || 0);

    if (campaign?.discount_type === 'percent') {
        return `%${value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
    }

    return `${value.toLocaleString('tr-TR', {
        maximumFractionDigits: 2,
    })} TL`;
}

function formatCampaignDates(campaign) {
    const localeOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const endDate = campaign?.ends_at ? new Date(campaign.ends_at) : null;

    if (!endDate || Number.isNaN(endDate.getTime())) {
        return 'No end date';
    }

    return new Intl.DateTimeFormat('en-US', localeOptions).format(endDate);
}

function formatUsage(campaign) {
    const usedCount = Math.max(0, Number(campaign?.used_count || 0));
    const usageLimit = campaign?.usage_limit ? Number(campaign.usage_limit) : null;

    if (!usageLimit) {
        return 'Unlimited uses';
    }

    return `${usedCount}/${usageLimit} uses`;
}

function formatCampaignStatus(status) {
    switch (status) {
        case 'active':
            return 'Active';
        case 'scheduled':
            return 'Scheduled';
        case 'inactive':
            return 'Inactive';
        case 'expired':
            return 'Expired';
        default:
            return String(status || '').replace(/^\w/, (match) => match.toUpperCase()) || 'Unknown';
    }
}

export default function HomeCampaignBar({ campaigns }) {
    const { enqueueSnackbar } = useSnackbar();
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    if (!Array.isArray(campaigns) || campaigns.length === 0) {
        return null;
    }

    const closeDialog = () => {
        setSelectedCampaign(null);
    };

    const copyCampaignCode = async () => {
        if (!selectedCampaign?.code) {
            return;
        }

        try {
            await navigator.clipboard.writeText(selectedCampaign.code);
            enqueueSnackbar('Campaign code copied.', { variant: 'success' });
        } catch {
            enqueueSnackbar('Campaign code could not be copied.', { variant: 'error' });
        }
    };

    return (
        <>
            <Box component="section" className="container mx-auto pt-4">
                <div className="no-scrollbar scrollbar-hide flex items-start gap-9 overflow-x-auto">
                    {campaigns.map((campaign) => {
                        const discountLabel = formatCampaignDiscount(campaign);

                        return (
                            <button
                                key={campaign.id || campaign.code}
                                type="button"
                                onClick={() => setSelectedCampaign(campaign)}
                                className="group flex min-w-[104px] max-w-[112px] flex-col items-center gap-2.5 text-center transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                                aria-label={`Open details for ${campaign.title}`}
                                title={campaign.description || `${discountLabel} discount - ${campaign.code}`}
                            >
                                <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-champagne p-[2px] shadow-[0_8px_18px_rgba(17,24,39,0.10)] transition-transform group-hover:scale-105">
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white to-accent/10">
                                        <LocalOfferRoundedIcon className="!text-[34px] text-accent drop-shadow-sm" />
                                    </div>
                                    <span className="absolute -bottom-1 rounded-full bg-accent px-2 py-0.5 text-[9px] font-black leading-none text-on-secondary-container shadow-sm">
                                        Active
                                    </span>
                                </div>
                                <span className="line-clamp-2 min-h-[32px] text-[13px] font-bold leading-4 text-[#333333]">
                                    {campaign.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Box>

            <Dialog
                open={Boolean(selectedCampaign)}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                BackdropProps={{
                    className: '!bg-slate-950/55 !backdrop-blur-sm',
                }}
                PaperProps={{
                    className: '!m-4 !overflow-hidden !rounded-[28px] !border !border-border-soft !bg-white !shadow-[0_24px_80px_rgba(15,23,42,0.25)]',
                }}
            >
                <DialogTitle className="!border-b !border-border-soft !bg-gradient-to-r !from-surface-container-low !to-white !px-6 !py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-on-secondary-container shadow-sm">
                                <CampaignRoundedIcon />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                                    Campaign Details
                                </p>
                                <h2 className="text-xl font-black text-on-surface">
                                    {selectedCampaign?.title}
                                </h2>
                            </div>
                        </div>

                        <IconButton
                            onClick={closeDialog}
                            className="!rounded-xl !text-outline transition-colors hover:!bg-surface-container-high hover:!text-on-surface"
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                {selectedCampaign ? (
                    <>
                        <DialogContent className="!px-6 !py-6">
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    <Chip
                                        label={formatCampaignStatus(selectedCampaign.status)}
                                        className="!rounded-full !bg-accent !font-bold !text-on-secondary-container"
                                    />
                                    <Chip
                                        label={formatCampaignDiscount(selectedCampaign)}
                                        className="!rounded-full !bg-secondary-fixed !font-bold !text-on-secondary-container"
                                    />
                                    <Chip
                                        label={formatUsage(selectedCampaign)}
                                        className="!rounded-full !bg-surface-container-high !font-bold !text-on-surface"
                                    />
                                </div>

                                <div className="rounded-3xl bg-surface-container-low p-5">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-outline">
                                        Campaign Code
                                    </p>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <code className="text-2xl font-black tracking-[0.28em] text-on-surface">
                                            {selectedCampaign.code}
                                        </code>
                                        <Button
                                            onClick={copyCampaignCode}
                                            variant="contained"
                                            startIcon={<ContentCopyRoundedIcon />}
                                            className="!rounded-full !bg-accent !px-5 !py-3 !font-bold !normal-case !text-on-secondary-container !shadow-none hover:!bg-accent/90"
                                        >
                                            Copy Code
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-base font-black text-on-surface">
                                        How to Use?
                                    </h3>
                                    <ol className="space-y-3 text-sm leading-6 text-outline">
                                        <li className="rounded-2xl border border-border-soft bg-white px-4 py-3">
                                            1. Add the products you like to your cart.
                                        </li>
                                        <li className="rounded-2xl border border-border-soft bg-white px-4 py-3">
                                            2. Go to checkout and enter the campaign code in the code field.
                                        </li>
                                        <li className="rounded-2xl border border-border-soft bg-white px-4 py-3">
                                            3. Complete your order once the discount is applied automatically.
                                        </li>
                                    </ol>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-border-soft bg-white p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-outline">
                                            Validity
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-on-surface">
                                            {formatCampaignDates(selectedCampaign)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border-soft bg-white p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-outline">
                                            Description
                                        </p>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-on-surface">
                                            {selectedCampaign.description || 'No description has been added for this campaign.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>

                        <DialogActions className="!justify-between !border-t !border-border-soft !bg-surface-container-low !px-6 !py-4">
                            <span className="text-xs font-medium text-outline">
                                You can copy the code before sharing it.
                            </span>
                            <Button
                                onClick={closeDialog}
                                variant="outlined"
                                className="!rounded-full !border-accent !px-5 !py-2.5 !font-bold !normal-case !text-accent"
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                ) : null}
            </Dialog>
        </>
    );
}
