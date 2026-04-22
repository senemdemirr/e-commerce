'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import ColorForm from '@/components/admin/ColorForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice';
import ColorsHeader from '@/components/admin/colors/ColorsHeader';
import ColorsStatsCards from '@/components/admin/colors/ColorsStatsCards';
import ColorsTable from '@/components/admin/colors/ColorsTable';
import { normalizeColorRecord } from '@/lib/admin/colors';
import { useAdminSession } from '@/context/AdminSessionContext';

const PAGE_SIZE = 6;

function buildPageNumbers(page, totalPages) {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    return [start, start + 1, start + 2];
}

export default function ColorsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const { canMutate, loading: adminLoading } = useAdminSession();
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedColor, setSelectedColor] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchColors() {
            try {
                setLoading(true);

                const response = await fetch('/api/admin/colors', {
                    headers: { role: 'admin' },
                });
                const data = await response.json().catch(() => []);

                if (!response.ok) {
                    throw new Error(data?.error || 'Colors could not be loaded');
                }

                if (!active) {
                    return;
                }

                setColors(Array.isArray(data) ? data.map((color) => normalizeColorRecord(color)) : []);
            } catch (error) {
                if (active) {
                    enqueueSnackbar(error.message || 'Colors could not be loaded', { variant: 'error' });
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchColors();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar]);

    const totalColors = colors.length;
    const usedColors = colors.filter((color) => color.is_used).length;
    const unusedColors = totalColors - usedColors;
    const totalPages = Math.max(1, Math.ceil(totalColors / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const visibleColors = colors.slice(startIndex, startIndex + PAGE_SIZE);
    const pageNumbers = buildPageNumbers(safePage, totalPages);

    useEffect(() => {
        if (page !== safePage) {
            setPage(safePage);
        }
    }, [page, safePage]);

    const openCreateModal = () => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can create colors.', { variant: 'warning' });
            return;
        }

        setFormMode('create');
        setSelectedColor(null);
        setFormOpen(true);
    };

    const openEditModal = (color) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can edit colors.', { variant: 'warning' });
            return;
        }

        setFormMode('edit');
        setSelectedColor(color);
        setFormOpen(true);
    };

    const openDeleteDialog = (color) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can delete colors.', { variant: 'warning' });
            return;
        }

        if (color?.is_used) {
            enqueueSnackbar(
                `This color is in use by ${Number(color.product_count || 0)} products and ${Number(color.variant_count || 0)} variants.`,
                { variant: 'warning' }
            );
            return;
        }

        setDeleteTarget(color);
    };

    const closeFormModal = () => {
        if (submitting) {
            return;
        }

        setFormOpen(false);
        setSelectedColor(null);
    };

    const closeDeleteDialog = () => {
        if (deleteLoading) {
            return;
        }

        setDeleteTarget(null);
    };

    const handleSubmitColor = async (payload) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can save color changes.', { variant: 'warning' });
            return;
        }

        const isEditMode = formMode === 'edit' && selectedColor?.id;
        const endpoint = isEditMode
            ? `/api/admin/colors/${selectedColor.id}`
            : '/api/admin/colors';

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
                throw new Error(data?.error || 'Color could not be saved');
            }

            const normalizedColor = normalizeColorRecord(data);

            if (isEditMode) {
                setColors((current) => current.map((color) => (
                    color.id === selectedColor.id
                        ? {
                            ...normalizedColor,
                            product_count: color.product_count,
                            variant_count: color.variant_count,
                            is_used: color.is_used,
                        }
                        : color
                )));
                enqueueSnackbar('Color updated', { variant: 'success' });
            } else {
                setColors((current) => [normalizedColor, ...current]);
                enqueueSnackbar('Color created', { variant: 'success' });
            }

            setFormOpen(false);
            setSelectedColor(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Color could not be saved', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteColor = async () => {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            const response = await fetch(`/api/admin/colors/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { role: 'admin' },
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Color could not be deleted');
            }

            setColors((current) => current.filter((color) => color.id !== deleteTarget.id));
            enqueueSnackbar('Color deleted', { variant: 'success' });
            setDeleteTarget(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Color could not be deleted', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <div className="-m-4 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden sm:-m-6 lg:-m-8">
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 dark:bg-background-dark/50 sm:p-6 lg:p-8">
                    <div className="w-full">
                        {!adminLoading && !canMutate ? (
                            <ReadOnlyNotice className="mb-6" description="This account can review color data but color creation, editing, and deletion are limited to superadmin." />
                        ) : null}

                        <ColorsHeader onCreate={openCreateModal} canMutate={canMutate} />

                        <ColorsStatsCards
                            totalColors={totalColors}
                            usedColors={usedColors}
                            unusedColors={unusedColors}
                        />

                        <ColorsTable
                            loading={loading}
                            visibleColors={visibleColors}
                            totalColors={totalColors}
                            startIndex={startIndex}
                            pageSize={PAGE_SIZE}
                            pageNumbers={pageNumbers}
                            safePage={safePage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            onEdit={openEditModal}
                            onDelete={openDeleteDialog}
                            canMutate={canMutate}
                        />
                    </div>
                </div>
            </div>

            <ColorForm
                open={formOpen}
                mode={formMode}
                initialValues={selectedColor}
                submitting={submitting}
                onClose={closeFormModal}
                onSubmit={handleSubmitColor}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete color?"
                description={deleteTarget
                    ? `The color "${deleteTarget.name}" will be removed from the colors table. This action cannot be undone.`
                    : 'This action cannot be undone.'}
                confirmText="Delete"
                loading={deleteLoading}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteColor}
            />
        </>
    );
}
