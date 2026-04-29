'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice';
import { useAdminSession } from '@/context/AdminSessionContext';
import CustomerInfoCard from './components/CustomerInfoCard';
import OrderAdminNoteCard from './components/OrderAdminNoteCard';
import OrderDetailHeader from './components/OrderDetailHeader';
import OrderItemsCard from './components/OrderItemsCard';
import OrderPageActions from './components/OrderPageActions';
import OrderStatusCard from './components/OrderStatusCard';
import PaymentSummaryCard from './components/PaymentSummaryCard';
import {
    formatOrderStatusLabel,
    getStatusClasses,
    isCancelledStatus,
    isDeliveredStatus,
} from '@/lib/admin/order-display';
import { apiFetch } from '@/lib/apiFetch/fetch';

export default function OrderDetailPage() {
    const { orderNumber } = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { canMutate, loading: adminLoading } = useAdminSession();

    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const [adminNote, setAdminNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            try {
                setLoading(true);

                const [orderData, statusesData] = await Promise.all([
                    apiFetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
                        headers: { role: 'admin' },
                    }),
                    apiFetch('/api/admin/order-statuses', {
                        headers: { role: 'admin' },
                    }),
                ]);

                if (!active) {
                    return;
                }

                setOrder(orderData);
                setStatus(String(orderData.status_id ?? orderData.status ?? ''));
                setAdminNote(String(orderData.status_update_note || ''));
                setStatusOptions(statusesData.statuses || []);
            } catch (error) {
                enqueueSnackbar(error.message, { variant: 'error' });
                router.push('/admin/orders');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar, orderNumber, router]);

    const currentStatusOption = statusOptions.find((item) => String(item.id) === String(order?.status_id ?? order?.status));
    const rawCurrentStatusTitle = order?.status_title
        || currentStatusOption?.title
        || 'No status selected';
    const currentStatusTitle = formatOrderStatusLabel(rawCurrentStatusTitle);
    const currentStatusClasses = getStatusClasses(currentStatusTitle);
    const customerName = order?.customer_name?.trim() || order?.shipping_full_name || 'Guest Customer';
    const customerPhone = order?.customer_phone || order?.shipping_phone;
    const customerEmail = order?.customer_email || 'Email not available';
    const currentStatusId = String(order?.status_id ?? order?.status ?? '');
    const isStatusChanged = status !== '' && status !== currentStatusId;
    const savedAdminNote = String(order?.status_update_note || '');
    const isAdminNoteChanged = adminNote.trim() !== savedAdminNote.trim();
    const hasPendingChanges = isStatusChanged || isAdminNoteChanged;
    const cancelledStatus = statusOptions.find((item) => isCancelledStatus(item.title || item.id));
    const isCancelled = isCancelledStatus(rawCurrentStatusTitle);
    const isDelivered = isDeliveredStatus(rawCurrentStatusTitle);
    const isStatusLocked = isCancelled || isDelivered;
    const statusUpdatedByAdmin = order?.status_updated_by_admin_name || order?.status_updated_by_admin_email;

    const updateStatus = async ({ nextStatus = status, nextNote = adminNote, closeAfterUpdate = false } = {}) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can update orders.', { variant: 'warning' });
            return;
        }

        if (!nextStatus) {
            enqueueSnackbar('Please select a valid status', { variant: 'warning' });
            return;
        }

        const hasStatusChanged = String(nextStatus) !== currentStatusId;
        const normalizedNextNote = String(nextNote || '').trim();
        const hasNoteChanged = normalizedNextNote !== savedAdminNote.trim();

        if (!hasStatusChanged && !hasNoteChanged && !closeAfterUpdate) {
            return;
        }

        try {
            setSaving(true);
            const data = await apiFetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify({
                    status: nextStatus,
                    statusUpdateNote: normalizedNextNote,
                }),
            });

            const nextTitle = data.status_title
                || statusOptions.find((item) => String(item.id) === String(data.status ?? nextStatus))?.title
                || currentStatusTitle;

            setOrder((prev) => ({
                ...prev,
                ...data,
                status_id: data.status_id ?? data.status ?? nextStatus,
                status: data.status ?? nextStatus,
                status_title: nextTitle,
                status_update_note: normalizedNextNote || null,
            }));
            setStatus(String(data.status_id ?? data.status ?? nextStatus));
            setAdminNote(normalizedNextNote);
            enqueueSnackbar('Order status updated', { variant: 'success' });

            if (closeAfterUpdate) {
                router.push('/admin/orders');
            }
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can cancel orders.', { variant: 'warning' });
            return;
        }

        if (!cancelledStatus) {
            enqueueSnackbar('Cancelled status was not found', { variant: 'error' });
            return;
        }

        await updateStatus({ nextStatus: String(cancelledStatus.id) });
    };

    const handleBack = () => {
        router.push('/admin/orders');
    };

    const handleSaveAndClose = () => {
        if (!hasPendingChanges) {
            router.push('/admin/orders');
            return;
        }

        updateStatus({ closeAfterUpdate: true });
    };

    if (loading || adminLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <CircularProgress className="!text-primary" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <div className="flex w-full flex-col gap-6">
                {!canMutate ? (
                    <ReadOnlyNotice description="This account can review order details but status changes, cancel actions, and admin notes are limited to superadmin." />
                ) : null}

                <OrderDetailHeader
                    order={order}
                    currentStatusTitle={currentStatusTitle}
                    currentStatusClasses={currentStatusClasses}
                    saving={saving}
                    cancelledStatus={cancelledStatus}
                    isStatusLocked={isStatusLocked}
                    canMutate={canMutate}
                    onCancelOrder={handleCancelOrder}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="flex flex-col gap-6 xl:col-span-2">
                        <OrderItemsCard items={order.items} />
                        <OrderAdminNoteCard
                            value={adminNote}
                            disabled={isStatusLocked || !canMutate}
                            hasSavedNote={Boolean(savedAdminNote.trim())}
                            canMutate={canMutate}
                            onChange={setAdminNote}
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <OrderStatusCard
                            status={status}
                            statusOptions={statusOptions}
                            currentStatusTitle={currentStatusTitle}
                            currentStatusClasses={currentStatusClasses}
                            statusUpdatedByAdmin={statusUpdatedByAdmin}
                            statusUpdatedAt={order.status_updated_at}
                            saving={saving}
                            hasPendingChanges={hasPendingChanges}
                            isStatusLocked={isStatusLocked}
                            canMutate={canMutate}
                            onStatusChange={setStatus}
                            onUpdateStatus={() => updateStatus()}
                        />
                        <CustomerInfoCard
                            order={order}
                            customerName={customerName}
                            customerEmail={customerEmail}
                            customerPhone={customerPhone}
                        />
                        <PaymentSummaryCard order={order} />
                    </div>
                </div>

                <OrderPageActions
                    saving={saving}
                    isStatusLocked={isStatusLocked}
                    canMutate={canMutate}
                    onBack={handleBack}
                    onSaveAndClose={handleSaveAndClose}
                />
            </div>
        </div>
    );
}
