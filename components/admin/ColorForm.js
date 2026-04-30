'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import AppDialog from '@/components/common/AppDialog';

function normalizeHexInput(value = '') {
    const normalized = String(value || '').trim().toUpperCase().replace(/[^#0-9A-F]/g, '');

    if (!normalized) {
        return '#';
    }

    if (!normalized.startsWith('#')) {
        return `#${normalized.slice(0, 6)}`;
    }

    return `#${normalized.slice(1, 7)}`;
}

function isValidHex(value) {
    return /^#[0-9A-F]{6}$/.test(normalizeHexInput(value));
}

export default function ColorForm({
    open,
    mode = 'create',
    initialValues = {},
    submitting = false,
    onClose,
    onSubmit,
}) {
    const [values, setValues] = useState({ name: '', hex: '#111827' });
    const [errors, setErrors] = useState({ name: '', hex: '' });

    useEffect(() => {
        if (!open) {
            return;
        }

        setValues({
            name: initialValues?.name || '',
            hex: initialValues?.hex || '#111827',
        });
        setErrors({ name: '', hex: '' });
    }, [initialValues, open]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: values.name.trim(),
            hex: normalizeHexInput(values.hex),
        };

        const nextErrors = {
            name: payload.name ? '' : 'Color name is required.',
            hex: isValidHex(payload.hex) ? '' : 'Enter a valid 6-digit hex code.',
        };

        setErrors(nextErrors);

        if (nextErrors.name || nextErrors.hex) {
            return;
        }

        await onSubmit(payload);
    };

    const isEditMode = mode === 'edit';
    const title = isEditMode ? 'Edit Color' : 'Create Color';
    const submitLabel = submitting
        ? 'Saving...'
        : isEditMode ? 'Save Changes' : 'Create Color';
    const HeaderIcon = isEditMode ? DriveFileRenameOutlineRoundedIcon : PaletteRoundedIcon;

    return (
        <AppDialog
            open={open}
            onClose={submitting ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            BackdropProps={{
                className: '!bg-slate-900/40 !backdrop-blur-sm',
            }}
            PaperProps={{
                className: '!m-4 !w-full !max-w-[560px] !overflow-hidden !rounded-xl !border !border-slate-200 !bg-white !shadow-2xl dark:!border-slate-800 dark:!bg-slate-900',
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle className="!border-b !border-slate-100 !bg-white !p-6 dark:!border-slate-800 dark:!bg-slate-900">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <HeaderIcon />
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

                <DialogContent className="!p-6">
                    <div className="space-y-5">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage reusable storefront colors from one place. Product variation forms will read from this table.
                        </p>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Color Name
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={values.name}
                                onChange={(event) => {
                                    setValues((current) => ({ ...current, name: event.target.value }));
                                    if (errors.name) {
                                        setErrors((current) => ({ ...current, name: '' }));
                                    }
                                }}
                                placeholder="e.g. Stone Beige"
                                className={`h-12 w-full rounded-lg border bg-white px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:bg-slate-800 dark:text-slate-100 ${
                                    errors.name
                                        ? 'border-red-300 dark:border-red-500'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            />
                            {errors.name ? (
                                <p className="text-xs font-medium text-red-500">{errors.name}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Hex Code
                            </label>
                            <div className="grid gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
                                <div className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                                    <input
                                        type="color"
                                        value={isValidHex(values.hex) ? normalizeHexInput(values.hex) : '#111827'}
                                        onChange={(event) => {
                                            setValues((current) => ({ ...current, hex: normalizeHexInput(event.target.value) }));
                                            if (errors.hex) {
                                                setErrors((current) => ({ ...current, hex: '' }));
                                            }
                                        }}
                                        className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={values.hex}
                                    onChange={(event) => {
                                        setValues((current) => ({ ...current, hex: normalizeHexInput(event.target.value) }));
                                        if (errors.hex) {
                                            setErrors((current) => ({ ...current, hex: '' }));
                                        }
                                    }}
                                    placeholder="#111827"
                                    className={`h-12 w-full rounded-lg border bg-white px-4 font-mono text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:bg-slate-800 dark:text-slate-100 ${
                                        errors.hex
                                            ? 'border-red-300 dark:border-red-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                            </div>
                            {errors.hex ? (
                                <p className="text-xs font-medium text-red-500">{errors.hex}</p>
                            ) : null}
                        </div>
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
        </AppDialog>
    );
}
