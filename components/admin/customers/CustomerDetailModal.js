'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AppDialog from '@/components/common/AppDialog';

function ReadonlyField({
    label,
    value,
    type = 'text',
    icon: Icon,
}) {
    return (
        <div className="space-y-1.5">
            <label className="pl-1 text-[11px] font-bold uppercase tracking-[0.22em] text-text-muted">
                {label}
            </label>
            <div className="group relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/80">
                    <Icon fontSize="small" />
                </span>
                <input
                    disabled
                    type={type}
                    value={value}
                    className="w-full rounded-xl border border-primary/10 bg-background-light px-3 py-3 pl-10 text-sm font-semibold text-text-main outline-none disabled:cursor-not-allowed disabled:opacity-100"
                />
            </div>
        </div>
    );
}

export default function CustomerDetailModal({
    open,
    customer,
    updating = false,
    canMutate = true,
    onClose,
    onSave,
}) {
    const isActive = Number(customer?.activate ?? 1) === 1;
    const [draftActive, setDraftActive] = useState(isActive);

    useEffect(() => {
        if (!open) {
            return;
        }

        setDraftActive(Number(customer?.activate ?? 1) === 1);
    }, [customer?.activate, customer?.id, open]);

    const hasChanges = draftActive !== isActive;

    const handleSaveClick = async () => {
        if (!hasChanges) {
            onClose();
            return;
        }

        await onSave(draftActive);
    };

    return (
        <AppDialog
            open={open}
            onClose={updating ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            BackdropProps={{
                className: '!bg-text-main/40 !backdrop-blur-sm',
            }}
            PaperProps={{
                className: '!relative !m-4 !w-full !max-w-xl !overflow-hidden !rounded-xl !border !border-primary/10 !bg-white !shadow-sm',
            }}
        >
            <div className="pointer-events-none absolute -left-8 top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-12 h-24 w-24 rounded-full bg-accent/15 blur-3xl" />
            <div className="pointer-events-none absolute right-4 top-3 opacity-5">
                <ManageAccountsRoundedIcon className="!h-28 !w-28 rotate-12 text-text-main" />
            </div>

            <DialogTitle className="!border-b !border-primary/10 !px-8 !py-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-display text-xl font-black tracking-tight text-text-main">
                            Customer Details
                        </h2>
                        <p className="mt-0.5 text-xs font-semibold text-text-muted">
                            Customer Identity Management
                        </p>
                    </div>

                    <IconButton
                        onClick={onClose}
                        disabled={updating}
                        className="!h-10 !w-10 !rounded-full !text-text-muted transition-all hover:!bg-background-light hover:!text-text-main"
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </div>
            </DialogTitle>

            <DialogContent className="!p-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <ReadonlyField
                            label="First Name"
                            value={customer?.name ?? ''}
                            icon={PersonRoundedIcon}
                        />
                        <ReadonlyField
                            label="Last Name"
                            value={customer?.surname ?? ''}
                            icon={BadgeRoundedIcon}
                        />
                    </div>

                    <ReadonlyField
                        label="Email"
                        value={customer?.email ?? ''}
                        type="email"
                        icon={MailOutlineRoundedIcon}
                    />

                    <div className="h-px w-full bg-primary/10" />

                    <div className="flex flex-col gap-4 rounded-xl border border-primary/10 bg-background-light/70 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary-dark">
                                <CheckCircleRoundedIcon />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-main">Account Status</p>
                                <p className="text-xs text-text-muted">Customer account access</p>
                            </div>
                        </div>

                        <label className={`relative inline-flex items-center ${updating ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                checked={draftActive}
                                onChange={(event) => setDraftActive(event.target.checked)}
                                disabled={updating || !canMutate}
                                className="peer sr-only"
                            />
                            <div className="relative h-7 w-14 rounded-full border border-primary/10 bg-white transition-all after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-text-main after:shadow-sm after:transition-transform peer-checked:border-primary/20 peer-checked:bg-primary/25 peer-checked:after:translate-x-7 peer-checked:after:bg-primary-dark" />
                            <span className={`ml-3 text-xs font-black uppercase tracking-[0.18em] ${draftActive ? 'text-primary-dark' : 'text-text-muted'}`}>
                                {draftActive ? 'Active' : 'Inactive'}
                            </span>
                        </label>
                    </div>
                </div>
            </DialogContent>

            <DialogActions className="!px-8 !pb-8 !pt-0">
                <div className="flex w-full flex-col gap-4 sm:flex-row">
                    <Button
                        onClick={onClose}
                        disabled={updating}
                        variant="outlined"
                        className="!flex-1 !rounded-xl !border !border-primary/10 !bg-white !px-6 !py-3.5 !font-bold !normal-case !text-text-muted hover:!border-primary/20 hover:!bg-background-light hover:!text-text-main"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveClick}
                        disabled={updating || !canMutate}
                        startIcon={<SaveRoundedIcon />}
                        className="!flex-[2] !rounded-xl !bg-primary !px-6 !py-3.5 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white disabled:!bg-primary/20 disabled:!text-text-muted"
                    >
                        {canMutate ? (updating ? 'Saving...' : 'Save') : 'Superadmin Required'}
                    </Button>
                </div>
            </DialogActions>
        </AppDialog>
    );
}
