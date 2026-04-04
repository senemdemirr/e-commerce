'use client';

import { Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

export default function OrderPageActions({
    saving,
    isStatusLocked,
    canMutate,
    onBack,
    onSaveAndClose,
}) {
    return (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-t border-primary/10 pt-6">
            <Button
                onClick={onBack}
                startIcon={<ArrowBackRoundedIcon />}
                className="!rounded-2xl !border !border-primary/10 !bg-white !px-6 !py-3 !font-bold !text-text-main hover:!bg-background-light"
            >
                Back
            </Button>

            <Button
                onClick={onSaveAndClose}
                disabled={saving || isStatusLocked || !canMutate}
                startIcon={<SaveRoundedIcon />}
                className="!rounded-2xl !bg-primary !px-6 !py-3 !font-bold !text-white hover:!bg-primary-dark disabled:!opacity-50"
            >
                {canMutate ? (saving ? 'Saving...' : 'Save and Close') : 'Read Only'}
            </Button>
        </div>
    );
}
