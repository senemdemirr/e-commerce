'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button, CircularProgress, IconButton } from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CategoryForm from '@/components/admin/CategoryForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CategoryIcon from '@mui/icons-material/Category';

const PAGE_SIZE = 4;

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function normalizeCategory(category) {
    return {
        ...category,
        product_count: Number(category?.product_count || 0),
        subcategories: Array.isArray(category?.subcategories) ? category.subcategories : [],
    };
}

function getCategoryStatus(category) {
    const isActive = Number(category?.product_count || 0) > 0;

    if (isActive) {
        return {
            label: 'Active',
            chipClassName: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            dotClassName: 'bg-green-500',
        };
    }

    return {
        label: 'Inactive',
        chipClassName: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        dotClassName: 'bg-slate-400',
    };
}


function buildPageNumbers(page, totalPages) {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    return [start, start + 1, start + 2];
}

export default function CategoriesPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchCategories = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/admin/categories', {
                    headers: { role: 'admin' },
                });
                const data = await response.json().catch(() => []);

                if (!response.ok) {
                    throw new Error(data?.error || 'Categories could not be loaded');
                }

                if (!active) {
                    return;
                }

                setCategories(Array.isArray(data) ? data.map(normalizeCategory) : []);
            } catch (error) {
                if (active) {
                    enqueueSnackbar(error.message || 'Categories could not be loaded', { variant: 'error' });
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchCategories();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar]);

    const totalCategories = categories.length;
    const activeCategories = categories.filter((category) => Number(category.product_count || 0) > 0).length;
    const inactiveCategories = totalCategories - activeCategories;
    const totalPages = Math.max(1, Math.ceil(totalCategories / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const visibleCategories = categories.slice(startIndex, startIndex + PAGE_SIZE);
    const pageNumbers = buildPageNumbers(safePage, totalPages);

    useEffect(() => {
        if (page !== safePage) {
            setPage(safePage);
        }
    }, [page, safePage]);

    const openCreateModal = () => {
        setFormMode('create');
        setSelectedCategory(null);
        setFormOpen(true);
    };

    const openEditModal = (category) => {
        setFormMode('edit');
        setSelectedCategory(category);
        setFormOpen(true);
    };

    const closeFormModal = () => {
        if (submitting) {
            return;
        }

        setFormOpen(false);
        setSelectedCategory(null);
    };

    const handleSubmitCategory = async (payload) => {
        const isEditMode = formMode === 'edit' && selectedCategory?.id;
        const endpoint = isEditMode
            ? `/api/admin/categories/${selectedCategory.id}`
            : '/api/admin/categories';

        try {
            setSubmitting(true);

            const response = await fetch(endpoint, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Category could not be saved');
            }

            if (isEditMode) {
                setCategories((current) => current.map((category) => {
                    if (category.id !== selectedCategory.id) {
                        return category;
                    }

                    return normalizeCategory({
                        ...category,
                        ...data,
                        product_count: category.product_count,
                        subcategories: category.subcategories,
                    });
                }));
                enqueueSnackbar('Category updated', { variant: 'success' });
            } else {
                setCategories((current) => [normalizeCategory(data), ...current]);
                enqueueSnackbar('Category created', { variant: 'success' });
            }

            setFormOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Category could not be saved', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { role: 'admin' },
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Category could not be deleted');
            }

            setCategories((current) => current.filter((category) => category.id !== deleteTarget.id));
            enqueueSnackbar('Category deleted', { variant: 'success' });
            setDeleteTarget(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Category could not be deleted', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Categories',
            value: totalCategories,
            icon: CategoryRoundedIcon,
            iconClassName: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
            title: 'Active',
            value: activeCategories,
            icon: CheckCircleRoundedIcon,
            iconClassName: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            title: 'Inactive',
            value: inactiveCategories,
            icon: VisibilityOffRoundedIcon,
            iconClassName: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        },
    ];

    return (
        <>
            <div className="-m-8 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 dark:bg-background-dark/50">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Category Management
                                </h2>
                                <p className="mt-1 font-medium text-slate-500">
                                    Create, organize and manage your product catalog structure.
                                </p>
                            </div>

                            <Button
                                variant="contained"
                                disableElevation
                                startIcon={<AddCircleRoundedIcon className="!text-xl" />}
                                onClick={openCreateModal}
                                sx={{ textTransform: 'none' }}
                                className="!rounded-xl !bg-primary !px-6 !py-3 !font-extrabold !text-slate-900 !shadow-lg !shadow-primary/20 transition-all hover:!-translate-y-0.5 hover:!bg-primary-dark active:!translate-y-0"
                            >
                                New Category
                            </Button>
                        </div>

                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                            {statCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <div
                                        key={card.title}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex size-12 items-center justify-center rounded-xl ${card.iconClassName}`}>
                                                <Icon />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                                    {card.title}
                                                </p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {formatNumber(card.value)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            {loading ? (
                                <div className="flex min-h-[420px] items-center justify-center">
                                    <CircularProgress className="!text-primary" />
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                                        Category Name &amp; Slug
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                                        Products
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {visibleCategories.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-16 text-center">
                                                            <div className="mx-auto max-w-sm">
                                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                                    No categories yet
                                                                </p>
                                                                <p className="mt-2 text-sm text-slate-500">
                                                                    Create your first category to start building the catalog structure.
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : visibleCategories.map((category) => {
                                                    const status = getCategoryStatus(category);

                                                    return (
                                                        <tr
                                                            key={category.id}
                                                            className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                                        >
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-800">
                                                                        <CategoryIcon />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-base font-bold text-slate-900 dark:text-white">
                                                                            {category.name}
                                                                        </div>
                                                                        <div className="font-mono text-xs font-bold text-primary">
                                                                            /{category.slug}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                                    {formatNumber(category.product_count)} items
                                                                </span>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="flex justify-center">
                                                                    <span
                                                                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${status.chipClassName}`}
                                                                    >
                                                                        <span
                                                                            className={`size-1.5 rounded-full ${status.dotClassName} ${status.label === 'Active' ? 'animate-pulse' : ''}`}
                                                                        />
                                                                        {status.label}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <IconButton
                                                                        onClick={() => openEditModal(category)}
                                                                        title="Edit"
                                                                        className="!rounded-lg !p-2 !text-slate-400 transition-all hover:!bg-primary/5 hover:!text-primary"
                                                                    >
                                                                        <EditRoundedIcon className="!text-lg" />
                                                                    </IconButton>

                                                                    <IconButton
                                                                        onClick={() => setDeleteTarget(category)}
                                                                        title="Delete"
                                                                        className="!rounded-lg !p-2 !text-slate-400 transition-all hover:!bg-red-50 hover:!text-red-500"
                                                                    >
                                                                        <DeleteRoundedIcon className="!text-lg" />
                                                                    </IconButton>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-500">
                                            Showing {totalCategories === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, totalCategories)} of {formatNumber(totalCategories)} categories
                                        </p>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                                disabled={safePage <= 1}
                                                className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                                            >
                                                <ChevronLeftRoundedIcon className="!text-lg" />
                                            </button>

                                            {pageNumbers.map((pageNumber) => (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    onClick={() => setPage(pageNumber)}
                                                    className={pageNumber === safePage
                                                        ? 'flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-slate-900'
                                                        : 'flex size-8 items-center justify-center rounded-lg text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800'}
                                                >
                                                    {pageNumber}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                                disabled={safePage >= totalPages}
                                                className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                                            >
                                                <ChevronRightRoundedIcon className="!text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CategoryForm
                open={formOpen}
                mode={formMode}
                initialValues={selectedCategory}
                submitting={submitting}
                onClose={closeFormModal}
                onSubmit={handleSubmitCategory}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={deleteTarget ? `Delete ${deleteTarget.name}?` : 'Delete category?'}
                description={deleteTarget
                    ? 'This action will permanently remove the category and any connected subcategories.'
                    : 'This action cannot be undone.'}
                confirmText="Delete"
                loading={deleteLoading}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteCategory}
            />
        </>
    );
}
