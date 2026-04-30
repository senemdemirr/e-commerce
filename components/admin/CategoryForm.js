'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import AppDialog from '@/components/common/AppDialog';

function toCategorySlug(value = '') {
    const letterMap = {
        c: /[ç]/g,
        g: /[ğ]/g,
        i: /[ıİ]/g,
        o: /[ö]/g,
        s: /[ş]/g,
        u: /[ü]/g,
    };

    let normalized = String(value).trim().toLowerCase();

    Object.entries(letterMap).forEach(([replacement, pattern]) => {
        normalized = normalized.replace(pattern, replacement);
    });

    return normalized
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function resolveInitialActivate(initialValues) {
    if (typeof initialValues?.activate === 'number') {
        return initialValues.activate === 1;
    }

    if (typeof initialValues?.activate === 'boolean') {
        return initialValues.activate;
    }

    if (typeof initialValues?.is_active === 'boolean') {
        return initialValues.is_active;
    }

    return true;
}

export default function CategoryForm({
    open,
    mode = 'create',
    initialValues = {},
    submitting = false,
    onClose,
    onSubmit,
}) {
    const [values, setValues] = useState({ name: '', slug: '' });
    const [errors, setErrors] = useState({ name: '', slug: '' });
    const [slugTouched, setSlugTouched] = useState(false);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!open) {
            return;
        }

        const nextName = initialValues?.name || '';
        const nextSlug = initialValues?.slug || '';

        setValues({ name: nextName, slug: nextSlug });
        setErrors({ name: '', slug: '' });
        setSlugTouched(Boolean(nextSlug));
        setIsActive(resolveInitialActivate(initialValues));
    }, [initialValues, open]);

    const handleNameChange = (event) => {
        const nextName = event.target.value;

        setValues((current) => ({
            ...current,
            name: nextName,
            slug: slugTouched ? current.slug : toCategorySlug(nextName),
        }));

        if (errors.name) {
            setErrors((current) => ({ ...current, name: '' }));
        }
    };

    const handleSlugChange = (event) => {
        const nextSlug = toCategorySlug(event.target.value);
        setSlugTouched(true);
        setValues((current) => ({ ...current, slug: nextSlug }));

        if (errors.slug) {
            setErrors((current) => ({ ...current, slug: '' }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: values.name.trim(),
            slug: toCategorySlug(values.slug || values.name),
            activate: isActive ? 1 : 0,
        };

        const nextErrors = {
            name: payload.name ? '' : 'Category name is required.',
            slug: payload.slug ? '' : 'Slug is required.',
        };

        setErrors(nextErrors);

        if (nextErrors.name || nextErrors.slug) {
            return;
        }

        await onSubmit(payload);
    };

    const isEditMode = mode === 'edit';
    const title = isEditMode ? 'Edit Category' : 'Create Category';
    const submitLabel = submitting
        ? 'Saving...'
        : isEditMode ? 'Save Changes' : 'Create Category';
    const HeaderIcon = isEditMode ? DriveFileRenameOutlineRoundedIcon : CategoryRoundedIcon;

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
                            Fill out the fields below to create a new product group. The slug can be generated automatically.
                        </p>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Category Name
                            </label>
                            <div className="relative group">
                                <input
                                    autoFocus
                                    type="text"
                                    value={values.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Electronics"
                                    className={`h-12 w-full rounded-lg border bg-white px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:bg-slate-800 dark:text-slate-100 ${
                                        errors.name
                                            ? 'border-red-300 dark:border-red-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                            </div>
                            {errors.name ? (
                                <p className="text-xs font-medium text-red-500">{errors.name}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Slug (URL-Friendly Name)
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                You can edit this field manually or generate it from the category name.
                            </p>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <span className="text-sm">shop.com/</span>
                                </div>
                                <input
                                    type="text"
                                    value={values.slug}
                                    onChange={handleSlugChange}
                                    placeholder="electronics"
                                    className={`h-12 w-full rounded-lg border bg-white pl-[84px] pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:bg-slate-800 dark:text-slate-100 ${
                                        errors.slug
                                            ? 'border-red-300 dark:border-red-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                            </div>
                            {errors.slug ? (
                                <p className="text-xs font-medium text-red-500">{errors.slug}</p>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Category Status
                            </label>
                            <label className="group relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(event) => setIsActive(event.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700 rtl:peer-checked:after:-translate-x-full" />
                                <span className={`ms-3 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'text-slate-900 dark:text-slate-100'
                                        : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </label>
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
                        startIcon={isEditMode ? <DriveFileRenameOutlineRoundedIcon /> : <AddRoundedIcon />}
                        sx={{ textTransform: 'none' }}
                        className="!flex !h-11 !items-center !gap-2 !rounded-lg !bg-primary !px-6 !text-sm !font-bold !text-white !shadow-lg !shadow-primary/20 transition-all hover:!bg-primary-dark"
                    >
                        {submitLabel}
                    </Button>
                </DialogActions>
            </form>
        </AppDialog>
    );
}
