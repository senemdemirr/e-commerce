'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice';
import SizeForm from '@/components/admin/SizeForm';
import SizesHeader from '@/components/admin/sizes/SizesHeader';
import SizesStatsCards from '@/components/admin/sizes/SizesStatsCards';
import SizesTable from '@/components/admin/sizes/SizesTable';
import { useAdminSession } from '@/context/AdminSessionContext';
import { normalizeSizeRecord } from '@/lib/admin/sizes';
import { apiFetch } from '@/lib/apiFetch/fetch';

const PAGE_SIZE = 6;

function buildPageNumbers(page, totalPages) {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    return [start, start + 1, start + 2];
}

export default function SizesPage() {
    const { enqueueSnackbar } = useSnackbar();
    const { canMutate, loading: adminLoading } = useAdminSession();
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedSize, setSelectedSize] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchSizes() {
            try {
                setLoading(true);

                const data = await apiFetch('/api/admin/sizes', {
                    headers: { role: 'admin' },
                });

                if (!active) {
                    return;
                }

                setSizes(Array.isArray(data) ? data.map((size) => normalizeSizeRecord(size)) : []);
            } catch (error) {
                if (active) {
                    enqueueSnackbar(error.message || 'Sizes could not be loaded', { variant: 'error' });
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchSizes();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar]);

    const totalSizes = sizes.length;
    const usedSizes = sizes.filter((size) => size.is_used).length;
    const unusedSizes = totalSizes - usedSizes;
    const totalPages = Math.max(1, Math.ceil(totalSizes / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const visibleSizes = sizes.slice(startIndex, startIndex + PAGE_SIZE);
    const pageNumbers = buildPageNumbers(safePage, totalPages);

    useEffect(() => {
        if (page !== safePage) {
            setPage(safePage);
        }
    }, [page, safePage]);

    const openCreateModal = () => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can create sizes.', { variant: 'warning' });
            return;
        }

        setFormMode('create');
        setSelectedSize(null);
        setFormOpen(true);
    };

    const openEditModal = (size) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can edit sizes.', { variant: 'warning' });
            return;
        }

        setFormMode('edit');
        setSelectedSize(size);
        setFormOpen(true);
    };

    const openDeleteDialog = (size) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can delete sizes.', { variant: 'warning' });
            return;
        }

        if (size?.is_used) {
            enqueueSnackbar(
                `This size is in use by ${Number(size.product_count || 0)} products and ${Number(size.variant_count || 0)} variants.`,
                { variant: 'warning' }
            );
            return;
        }

        setDeleteTarget(size);
    };

    const closeFormModal = () => {
        if (submitting) {
            return;
        }

        setFormOpen(false);
        setSelectedSize(null);
    };

    const closeDeleteDialog = () => {
        if (deleteLoading) {
            return;
        }

        setDeleteTarget(null);
    };

    const handleSubmitSize = async (payload) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can save size changes.', { variant: 'warning' });
            return;
        }

        const isEditMode = formMode === 'edit' && selectedSize?.id;
        const endpoint = isEditMode
            ? `/api/admin/sizes/${selectedSize.id}`
            : '/api/admin/sizes';

        try {
            setSubmitting(true);

            const data = await apiFetch(endpoint, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify(payload),
            });

            const normalizedSize = normalizeSizeRecord(data);

            if (isEditMode) {
                setSizes((current) => current.map((size) => (
                    size.id === selectedSize.id
                        ? {
                            ...normalizedSize,
                            product_count: size.product_count,
                            variant_count: size.variant_count,
                            is_used: size.is_used,
                        }
                        : size
                )));
                enqueueSnackbar('Size updated', { variant: 'success' });
            } else {
                setSizes((current) => [normalizedSize, ...current]);
                enqueueSnackbar('Size created', { variant: 'success' });
            }

            setFormOpen(false);
            setSelectedSize(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Size could not be saved', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSize = async () => {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            await apiFetch(`/api/admin/sizes/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { role: 'admin' },
            });

            setSizes((current) => current.filter((size) => size.id !== deleteTarget.id));
            enqueueSnackbar('Size deleted', { variant: 'success' });
            setDeleteTarget(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Size could not be deleted', { variant: 'error' });
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
                            <ReadOnlyNotice className="mb-6" description="This account can review size data but size creation, editing, and deletion are limited to superadmin." />
                        ) : null}

                        <SizesHeader onCreate={openCreateModal} canMutate={canMutate} />

                        <SizesStatsCards
                            totalSizes={totalSizes}
                            usedSizes={usedSizes}
                            unusedSizes={unusedSizes}
                        />

                        <SizesTable
                            loading={loading}
                            visibleSizes={visibleSizes}
                            totalSizes={totalSizes}
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

            <SizeForm
                open={formOpen}
                mode={formMode}
                initialValues={selectedSize}
                submitting={submitting}
                onClose={closeFormModal}
                onSubmit={handleSubmitSize}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete size?"
                description={deleteTarget
                    ? `The size "${deleteTarget.name}" will be removed from the sizes table. This action cannot be undone.`
                    : 'This action cannot be undone.'}
                confirmText="Delete"
                loading={deleteLoading}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteSize}
            />
        </>
    );
}
