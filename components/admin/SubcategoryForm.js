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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';

function toSubcategorySlug(value = '') {
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

export default function SubcategoryForm({
    open,
    mode = 'create',
    categories = [],
    initialValues = {},
    submitting = false,
    onClose,
    onSubmit,
}) {
    const [values, setValues] = useState({ name: '', slug: '', category_id: '' });
    const [errors, setErrors] = useState({ name: '', slug: '', category_id: '' });
    const [slugTouched, setSlugTouched] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        const initialCategoryId = initialValues?.category_id || categories[0]?.id || '';

        setValues({
            name: initialValues?.name || '',
            slug: initialValues?.slug || '',
            category_id: initialCategoryId ? String(initialCategoryId) : '',
        });
        setErrors({ name: '', slug: '', category_id: '' });
        setSlugTouched(Boolean(initialValues?.slug));
    }, [categories, initialValues, open]);

    const selectedCategory = categories.find(
        (category) => String(category.id) === String(values.category_id)
    );

    const handleNameChange = (event) => {
        const nextName = event.target.value;

        setValues((current) => ({
            ...current,
            name: nextName,
            slug: slugTouched ? current.slug : toSubcategorySlug(nextName),
        }));

        if (errors.name) {
            setErrors((current) => ({ ...current, name: '' }));
        }
    };

    const handleSlugChange = (event) => {
        const nextSlug = toSubcategorySlug(event.target.value);
        setSlugTouched(true);
        setValues((current) => ({ ...current, slug: nextSlug }));

        if (errors.slug) {
            setErrors((current) => ({ ...current, slug: '' }));
        }
    };

    const handleCategoryChange = (event) => {
        setValues((current) => ({ ...current, category_id: event.target.value }));

        if (errors.category_id) {
            setErrors((current) => ({ ...current, category_id: '' }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: values.name.trim(),
            slug: toSubcategorySlug(values.slug || values.name),
            category_id: Number(values.category_id),
        };

        const nextErrors = {
            name: payload.name ? '' : 'Sub-category name is required.',
            slug: payload.slug ? '' : 'Slug is required.',
            category_id: payload.category_id ? '' : 'Parent category is required.',
        };

        setErrors(nextErrors);

        if (nextErrors.name || nextErrors.slug || nextErrors.category_id) {
            return;
        }

        await onSubmit(payload);
    };

    const isEditMode = mode === 'edit';
    const title = isEditMode ? 'Edit Sub-Category' : 'Create Sub-Category';
    const submitLabel = submitting
        ? 'Saving...'
        : isEditMode ? 'Save Changes' : 'Create Sub-Category';
    const HeaderIcon = isEditMode ? DriveFileRenameOutlineRoundedIcon : AccountTreeRoundedIcon;

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            BackdropProps={{
                className: '!bg-slate-900/40 !backdrop-blur-sm',
            }}
            PaperProps={{
                className: '!m-4 !w-full !max-w-[620px] !overflow-hidden !rounded-xl !border !border-slate-200 !bg-white !shadow-2xl dark:!border-slate-800 dark:!bg-slate-900',
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle className="!border-b !border-slate-100 !bg-white !p-6 dark:!border-slate-800 dark:!bg-slate-900">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <HeaderIcon />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                    {title}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Assign the sub-category to a parent category and define its URL slug.
                                </p>
                            </div>
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
                        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Sub-Category Name
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={values.name}
                                    onChange={handleNameChange}
                                    placeholder="Running Shoes"
                                    className={`h-12 w-full rounded-lg border bg-white px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 dark:text-slate-100 ${
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
                                    Parent Category
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <CategoryRoundedIcon className="!text-lg" />
                                    </div>
                                    <select
                                        value={values.category_id}
                                        onChange={handleCategoryChange}
                                        className={`h-12 w-full appearance-none rounded-lg border bg-white pl-12 pr-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 dark:text-slate-100 ${
                                            errors.category_id
                                                ? 'border-red-300 dark:border-red-500'
                                                : 'border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.category_id ? (
                                    <p className="text-xs font-medium text-red-500">{errors.category_id}</p>
                                ) : categories.length === 0 ? (
                                    <p className="text-xs font-medium text-amber-600">
                                        Create a category first before adding a sub-category.
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Slug
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Generated automatically from the name, but you can adjust it manually.
                            </p>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <span className="text-sm font-medium">
                                        /{selectedCategory?.slug || 'category'}/
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={values.slug}
                                    onChange={handleSlugChange}
                                    placeholder="running-shoes"
                                    className={`h-12 w-full rounded-lg border bg-white pl-[122px] pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 dark:text-slate-100 ${
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

                        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                URL Preview
                            </p>
                            <p className="mt-2 break-all font-mono text-xs font-bold text-primary">
                                /{selectedCategory?.slug || 'category'}/{values.slug || 'sub-category'}
                            </p>
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
                        disabled={submitting || categories.length === 0}
                        variant="contained"
                        disableElevation
                        startIcon={isEditMode ? <DriveFileRenameOutlineRoundedIcon /> : <AddRoundedIcon />}
                        sx={{ textTransform: 'none' }}
                        className="!flex !h-11 !items-center !gap-2 !rounded-lg !bg-primary !px-6 !text-sm !font-bold !text-slate-900 !shadow-lg !shadow-primary/20 transition-all hover:!bg-primary-dark"
                    >
                        {submitLabel}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
