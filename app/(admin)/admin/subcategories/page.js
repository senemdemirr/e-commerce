'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button, CircularProgress, IconButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

import ConfirmDialog from '@/components/admin/ConfirmDialog';
import SubcategoryForm from '@/components/admin/SubcategoryForm';

const PAGE_SIZE = 5;

function normalizeCategory(category) {
    return {
        id: Number(category?.id),
        name: category?.name || 'Untitled Category',
        slug: category?.slug || '',
        activate: Number(category?.activate ?? 1) === 1 ? 1 : 0,
    };
}

function normalizeSubcategory(subcategory) {
    return {
        id: Number(subcategory?.id),
        category_id: Number(subcategory?.category_id),
        name: subcategory?.name || 'Untitled Sub-Category',
        slug: subcategory?.slug || '',
        category_name: subcategory?.category_name || 'Unknown Category',
        category_slug: subcategory?.category_slug || '',
        product_count: Number(subcategory?.product_count || 0),
        created_at: subcategory?.created_at || null,
    };
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function buildPageNumbers(page, totalPages) {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    return [start, start + 1, start + 2];
}

function getSubcategoryStatus(subcategory) {
    const hasProducts = Number(subcategory?.product_count || 0) > 0;

    if (hasProducts) {
        return {
            label: 'Active',
            chipClassName: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            dotClassName: 'bg-green-500',
            filterValue: 'active',
            meta: `${formatNumber(subcategory.product_count)} products assigned`,
        };
    }

    return {
        label: 'Empty',
        chipClassName: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        dotClassName: 'bg-slate-400',
        filterValue: 'empty',
        meta: 'No products assigned yet',
    };
}

export default function SubcategoriesPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchPageData = async () => {
            try {
                setLoading(true);

                const [subcategoriesResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/admin/subcategories', {
                        headers: { role: 'admin' },
                    }),
                    fetch('/api/admin/categories', {
                        headers: { role: 'admin' },
                    }),
                ]);

                const [subcategoriesData, categoriesData] = await Promise.all([
                    subcategoriesResponse.json().catch(() => []),
                    categoriesResponse.json().catch(() => []),
                ]);

                if (!subcategoriesResponse.ok) {
                    throw new Error(subcategoriesData?.error || 'Sub-categories could not be loaded');
                }

                if (!categoriesResponse.ok) {
                    throw new Error(categoriesData?.error || 'Categories could not be loaded');
                }

                if (!active) {
                    return;
                }

                setSubcategories(
                    Array.isArray(subcategoriesData)
                        ? subcategoriesData.map(normalizeSubcategory)
                        : []
                );
                setCategories(
                    Array.isArray(categoriesData)
                        ? categoriesData.map(normalizeCategory)
                        : []
                );
            } catch (error) {
                if (active) {
                    enqueueSnackbar(error.message || 'Sub-categories could not be loaded', {
                        variant: 'error',
                    });
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchPageData();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar]);

    const totalSubcategories = subcategories.length;
    const activeSubcategories = subcategories.filter(
        (subcategory) => getSubcategoryStatus(subcategory).filterValue === 'active'
    ).length;
    const emptySubcategories = totalSubcategories - activeSubcategories;
    const totalProducts = subcategories.reduce(
        (sum, subcategory) => sum + Number(subcategory.product_count || 0),
        0
    );

    const filteredSubcategories = subcategories.filter((subcategory) => {
        const status = getSubcategoryStatus(subcategory);
        return filter === 'all' ? true : status.filterValue === filter;
    });

    const totalPages = Math.max(1, Math.ceil(filteredSubcategories.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const visibleSubcategories = filteredSubcategories.slice(startIndex, startIndex + PAGE_SIZE);
    const pageNumbers = buildPageNumbers(safePage, totalPages);

    useEffect(() => {
        if (page !== safePage) {
            setPage(safePage);
        }
    }, [page, safePage]);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    const openCreateModal = () => {
        if (categories.length === 0) {
            enqueueSnackbar('Create a category first before adding a sub-category', {
                variant: 'warning',
            });
            return;
        }

        setFormMode('create');
        setSelectedSubcategory(null);
        setFormOpen(true);
    };

    const openEditModal = (subcategory) => {
        setFormMode('edit');
        setSelectedSubcategory(subcategory);
        setFormOpen(true);
    };

    const closeFormModal = () => {
        if (submitting) {
            return;
        }

        setFormOpen(false);
        setSelectedSubcategory(null);
    };

    const handleSubmitSubcategory = async (payload) => {
        const isEditMode = formMode === 'edit' && selectedSubcategory?.id;
        const endpoint = isEditMode
            ? `/api/admin/subcategories/${selectedSubcategory.id}`
            : '/api/admin/subcategories';

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
                throw new Error(data?.error || 'Sub-category could not be saved');
            }

            const normalizedSubcategory = normalizeSubcategory(data);

            if (isEditMode) {
                setSubcategories((current) => current.map((subcategory) => (
                    subcategory.id === selectedSubcategory.id
                        ? {
                            ...subcategory,
                            ...normalizedSubcategory,
                            product_count: subcategory.product_count,
                        }
                        : subcategory
                )));
                enqueueSnackbar('Sub-category updated', { variant: 'success' });
            } else {
                setSubcategories((current) => [normalizedSubcategory, ...current]);
                enqueueSnackbar('Sub-category created', { variant: 'success' });
            }

            setFormOpen(false);
            setSelectedSubcategory(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Sub-category could not be saved', {
                variant: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubcategory = async () => {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            const response = await fetch(`/api/admin/subcategories/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { role: 'admin' },
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Sub-category could not be deleted');
            }

            setSubcategories((current) => current.filter(
                (subcategory) => subcategory.id !== deleteTarget.id
            ));
            enqueueSnackbar('Sub-category deleted', { variant: 'success' });
            setDeleteTarget(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Sub-category could not be deleted', {
                variant: 'error',
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filters = [
        { value: 'all', label: 'All', count: totalSubcategories },
        { value: 'active', label: 'Active', count: activeSubcategories },
        { value: 'empty', label: 'Empty', count: emptySubcategories },
    ];

    return (
        <>
            <div className="-m-8 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-3">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                                        Sub-Categories Management
                                    </h2>
                                    <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Manage product sub-hierarchies, keep parent mappings clean and monitor which groups are actively populated with products.
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="contained"
                                disableElevation
                                startIcon={<AddRoundedIcon className="!text-xl" />}
                                onClick={openCreateModal}
                                disabled={loading || categories.length === 0}
                                sx={{ textTransform: 'none' }}
                                className="!rounded-xl !bg-primary !px-6 !py-3 !font-extrabold !text-slate-900 !shadow-lg !shadow-primary/20 transition-all hover:!-translate-y-0.5 hover:!bg-primary-dark active:!translate-y-0 disabled:!bg-slate-200 disabled:!text-slate-500"
                            >
                                New Sub-Category
                            </Button>
                        </div>

                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
                                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary/10 to-transparent" />
                                <div className="relative flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Sub-Categories</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                                            {formatNumber(totalSubcategories)}
                                        </p>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <AppsRoundedIcon />
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
                                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-green-200/40 to-transparent dark:from-green-900/20" />
                                <div className="relative flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Active Groups</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                                            {formatNumber(activeSubcategories)}
                                        </p>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                                        <Inventory2RoundedIcon />
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
                                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-200/60 to-transparent dark:from-slate-800/60" />
                                <div className="relative flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Empty Groups</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                                            {formatNumber(emptySubcategories)}
                                        </p>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                        <FolderOpenRoundedIcon />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-slate-900">
                            <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {filters.map((item) => {
                                        const activeFilter = filter === item.value;

                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setFilter(item.value)}
                                                className={activeFilter
                                                    ? 'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-slate-900 shadow-sm'
                                                    : 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-primary/10 hover:text-slate-900 dark:hover:text-slate-100'}
                                            >
                                                <span>{item.label}</span>
                                                <span className={activeFilter ? 'text-slate-900/70' : 'text-slate-400'}>
                                                    {formatNumber(item.count)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {formatNumber(filteredSubcategories.length)} entries in the current view
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex min-h-[420px] items-center justify-center">
                                    <CircularProgress className="!text-primary" />
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                                        Sub-Category Name
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                                        Parent Category
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                                        Slug
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-primary/10">
                                                {visibleSubcategories.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-20 text-center">
                                                            <div className="mx-auto max-w-md">
                                                                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                                    <AppsRoundedIcon className="!text-3xl" />
                                                                </div>
                                                                <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-50">
                                                                    No sub-categories found
                                                                </h3>
                                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                                    Adjust the current filter or create a new sub-category to start organizing your catalog tree.
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : visibleSubcategories.map((subcategory) => {
                                                    const status = getSubcategoryStatus(subcategory);

                                                    return (
                                                        <tr
                                                            key={subcategory.id}
                                                            className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20"
                                                        >
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                                        <AppsRoundedIcon />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                                            {subcategory.name}
                                                                        </p>
                                                                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                            {status.meta}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="space-y-2">
                                                                    <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                                                                        {subcategory.category_name}
                                                                    </span>
                                                                    <p className="text-xs font-mono text-slate-400">
                                                                        /{subcategory.category_slug}
                                                                    </p>
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                    /{subcategory.category_slug}/{subcategory.slug}
                                                                </span>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="flex justify-center">
                                                                    <span
                                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${status.chipClassName}`}
                                                                    >
                                                                        <span className={`size-2 rounded-full ${status.dotClassName}`} />
                                                                        {status.label}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <IconButton
                                                                        onClick={() => openEditModal(subcategory)}
                                                                        title="Edit"
                                                                        className="!rounded-lg !p-2 !text-slate-400 transition-colors hover:!bg-primary/10 hover:!text-primary"
                                                                    >
                                                                        <EditRoundedIcon className="!text-lg" />
                                                                    </IconButton>

                                                                    <IconButton
                                                                        onClick={() => setDeleteTarget(subcategory)}
                                                                        title="Delete"
                                                                        className="!rounded-lg !p-2 !text-slate-400 transition-colors hover:!bg-red-50 hover:!text-red-500"
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

                                    <div className="flex flex-col gap-4 border-t border-primary/10 p-6 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Showing <span className="font-bold text-slate-900 dark:text-slate-100">
                                                {filteredSubcategories.length === 0 ? 0 : startIndex + 1}
                                            </span> to <span className="font-bold text-slate-900 dark:text-slate-100">
                                                {Math.min(startIndex + PAGE_SIZE, filteredSubcategories.length)}
                                            </span> of <span className="font-bold text-slate-900 dark:text-slate-100">
                                                {formatNumber(filteredSubcategories.length)}
                                            </span> results
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPage(Math.max(1, safePage - 1))}
                                                disabled={safePage <= 1}
                                                className="flex size-10 items-center justify-center rounded-lg border border-primary/20 text-slate-500 transition-colors hover:bg-primary/10 disabled:opacity-40"
                                            >
                                                <ChevronLeftRoundedIcon className="!text-lg" />
                                            </button>

                                            {pageNumbers.map((pageNumber) => (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    onClick={() => setPage(pageNumber)}
                                                    className={pageNumber === safePage
                                                        ? 'flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-bold text-slate-900'
                                                        : 'flex h-10 min-w-10 items-center justify-center rounded-lg border border-primary/20 px-3 text-sm font-bold text-slate-500 transition-colors hover:bg-primary/10'}
                                                >
                                                    {pageNumber}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                                                disabled={safePage >= totalPages}
                                                className="flex size-10 items-center justify-center rounded-lg border border-primary/20 text-slate-500 transition-colors hover:bg-primary/10 disabled:opacity-40"
                                            >
                                                <ChevronRightRoundedIcon className="!text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <SubcategoryForm
                open={formOpen}
                mode={formMode}
                categories={categories}
                initialValues={selectedSubcategory}
                submitting={submitting}
                onClose={closeFormModal}
                onSubmit={handleSubmitSubcategory}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={deleteTarget ? `Delete ${deleteTarget.name}?` : 'Delete sub-category?'}
                description={deleteTarget
                    ? 'This action will permanently remove the sub-category and unlink its product hierarchy.'
                    : 'This action cannot be undone.'}
                confirmText="Delete"
                loading={deleteLoading}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteSubcategory}
            />
        </>
    );
}
