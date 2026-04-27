'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
    formatCampaignDateTime,
    normalizeCampaignPayload,
    validateCampaignPayload,
} from '@/lib/admin/campaigns';

function toDateTimeInputValue(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
}

function normalizeCodeInput(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

const DEFAULT_VALUES = {
    title: '',
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
    usage_limit: '',
};

export default function CampaignForm({
    open,
    mode = 'create',
    initialValues = {},
    submitting = false,
    onClose,
    onSubmit,
}) {
    const [values, setValues] = useState(DEFAULT_VALUES);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        setValues({
            title: initialValues?.title || '',
            code: initialValues?.code || '',
            description: initialValues?.description || '',
            discount_type: initialValues?.discount_type || 'percent',
            discount_value: initialValues?.discount_value ? String(initialValues.discount_value) : '',
            starts_at: toDateTimeInputValue(initialValues?.starts_at),
            ends_at: toDateTimeInputValue(initialValues?.ends_at),
            is_active: initialValues?.is_active ?? true,
            usage_limit: initialValues?.usage_limit ? String(initialValues.usage_limit) : '',
        });
        setError('');
    }, [initialValues, open]);

    const updateValue = (key, value) => {
        setValues((current) => ({ ...current, [key]: value }));
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = normalizeCampaignPayload({
            ...values,
            code: normalizeCodeInput(values.code),
            starts_at: values.starts_at,
            ends_at: values.ends_at,
            usage_limit: values.usage_limit,
        });
        const validationError = validateCampaignPayload(payload);

        if (validationError) {
            setError(validationError);
            return;
        }

        await onSubmit(payload);
    };

    const isEditMode = mode === 'edit';
    const title = isEditMode ? 'Edit Campaign' : 'Create Campaign';
    const submitLabel = submitting
        ? 'Saving...'
        : isEditMode ? 'Save Changes' : 'Create Campaign';

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            fullWidth
            maxWidth="md"
            BackdropProps={{
                className: '!bg-slate-900/40 !backdrop-blur-sm',
            }}
            PaperProps={{
                className: '!m-4 !w-full !max-w-[760px] !overflow-hidden !rounded-xl !border !border-slate-200 !bg-white !shadow-2xl dark:!border-slate-800 dark:!bg-slate-900',
            }}
        >
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
                <DialogTitle className="!border-b !border-slate-100 !bg-white !p-6 dark:!border-slate-800 dark:!bg-slate-900">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                {isEditMode ? 'E' : 'C'}
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                {title}
                            </h2>
                        </div>

                        <IconButton
                            onClick={onClose}
                            disabled={submitting}
                            className="!rounded-lg !text-slate-400 transition-colors hover:!text-slate-600 dark:hover:!text-slate-200"
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent className="!p-6 !overflow-y-auto">
                    <div className="grid gap-5">
                        {error ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Campaign Title
                                </span>
                                <input
                                    autoFocus
                                    type="text"
                                    value={values.title}
                                    onChange={(event) => updateValue('title', event.target.value)}
                                    placeholder="Spring Launch"
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Campaign Code
                                </span>
                                <input
                                    type="text"
                                    value={values.code}
                                    onChange={(event) => updateValue('code', normalizeCodeInput(event.target.value))}
                                    placeholder="SPRING10"
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 font-mono text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </label>
                        </div>

                        <label className="space-y-2">
                            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Description
                            </span>
                            <textarea
                                value={values.description}
                                onChange={(event) => updateValue('description', event.target.value)}
                                rows={3}
                                placeholder="Internal campaign note"
                                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </label>

                        <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)_180px]">
                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Discount Type
                                </span>
                                <select
                                    value={values.discount_type}
                                    onChange={(event) => updateValue('discount_type', event.target.value)}
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                >
                                    <option value="percent">Percent</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </label>

                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Discount Value
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={values.discount_value}
                                    onChange={(event) => updateValue('discount_value', event.target.value)}
                                    placeholder={values.discount_type === 'percent' ? '10' : '100.00'}
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Usage Limit
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={values.usage_limit}
                                    onChange={(event) => updateValue('usage_limit', event.target.value)}
                                    placeholder="Unlimited"
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </label>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Starts At
                                </span>
                                <input
                                    type="datetime-local"
                                    value={values.starts_at}
                                    onChange={(event) => updateValue('starts_at', event.target.value)}
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                    Display: {formatCampaignDateTime(values.starts_at)}
                                </p>
                            </label>

                            <label className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Ends At
                                </span>
                                <input
                                    type="datetime-local"
                                    value={values.ends_at}
                                    onChange={(event) => updateValue('ends_at', event.target.value)}
                                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                />
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                    Display: {formatCampaignDateTime(values.ends_at)}
                                </p>
                            </label>
                        </div>

                        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                            <input
                                type="checkbox"
                                checked={values.is_active}
                                onChange={(event) => updateValue('is_active', event.target.checked)}
                                className="size-4 accent-primary"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                Campaign is active
                            </span>
                        </label>
                    </div>
                </DialogContent>

                <DialogActions className="!flex !items-center !justify-end !gap-3 !border-t !border-slate-100 !bg-slate-50 !p-6 dark:!border-slate-800 dark:!bg-slate-800/50">
                    <Button
                        onClick={onClose}
                        disabled={submitting}
                        sx={{ textTransform: 'none' }}
                        className="!h-11 !rounded-lg !px-6 !text-sm !font-bold !text-slate-600 transition-colors hover:!bg-slate-200 dark:!text-slate-300 dark:hover:!bg-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        variant="contained"
                        disableElevation
                        sx={{ textTransform: 'none' }}
                        className="!h-11 !rounded-lg !bg-primary !px-6 !text-sm !font-extrabold !text-slate-900 !shadow-lg !shadow-primary/20 transition-all hover:!-translate-y-0.5 hover:!bg-primary-dark active:!translate-y-0 disabled:!bg-slate-200 disabled:!text-slate-500"
                    >
                        {submitLabel}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
