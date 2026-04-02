'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import CategoryForm from '@/components/admin/CategoryForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CategoriesHeader from '@/components/admin/categories/CategoriesHeader';
import CategoriesStatsCards from '@/components/admin/categories/CategoriesStatsCards';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';

const PAGE_SIZE = 4;

function normalizeCategory(category) {
    return {
        ...category,
        activate: Number(category?.activate ?? 1) === 1 ? 1 : 0,
        product_count: Number(category?.product_count || 0),
        subcategories: Array.isArray(category?.subcategories) ? category.subcategories : [],
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
    const activeCategories = categories.filter((category) => Number(category.activate) === 1).length;
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

    return (
        <>
            <div className="-m-8 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 dark:bg-background-dark/50">
                    <div className="mx-auto max-w-6xl">
                        <CategoriesHeader onCreate={openCreateModal} />

                        <CategoriesStatsCards
                            totalCategories={totalCategories}
                            activeCategories={activeCategories}
                            inactiveCategories={inactiveCategories}
                        />

                        <CategoriesTable
                            loading={loading}
                            visibleCategories={visibleCategories}
                            totalCategories={totalCategories}
                            startIndex={startIndex}
                            pageSize={PAGE_SIZE}
                            pageNumbers={pageNumbers}
                            safePage={safePage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            onEdit={openEditModal}
                            onDelete={setDeleteTarget}
                        />
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
