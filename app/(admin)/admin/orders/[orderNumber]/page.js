'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import CustomerInfoCard from './components/CustomerInfoCard';
import OrderAdminNoteCard from './components/OrderAdminNoteCard';
import OrderDetailHeader from './components/OrderDetailHeader';
import OrderItemsCard from './components/OrderItemsCard';
import OrderPageActions from './components/OrderPageActions';
import OrderStatusCard from './components/OrderStatusCard';
import PaymentSummaryCard from './components/PaymentSummaryCard';
import { getStatusClasses, normalizeStatusTitle } from './orderDetail.utils';

export default function OrderDetailPage() {
    const { orderNumber } = useParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

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

                const [orderRes, statusesRes] = await Promise.all([
                    fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
                        headers: { role: 'admin' },
                    }),
                    fetch('/api/admin/order-statuses', {
                        headers: { role: 'admin' },
                    }),
                ]);

                const orderData = await orderRes.json();
                const statusesData = await statusesRes.json();

                if (!orderRes.ok) {
                    throw new Error(orderData.error || 'Sipariş bilgileri alınamadı');
                }

                if (!statusesRes.ok) {
                    throw new Error(statusesData.error || 'Sipariş durumları alınamadı');
                }

                if (!active) {
                    return;
                }

                setOrder(orderData);
                setStatus(String(orderData.status_id ?? orderData.status ?? ''));
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
    const currentStatusTitle = order?.status_title
        || currentStatusOption?.title
        || 'Durum seçilmedi';
    const currentStatusClasses = getStatusClasses(currentStatusTitle);
    const customerName = order?.customer_name?.trim() || order?.shipping_full_name || 'Misafir Müşteri';
    const customerPhone = order?.customer_phone || order?.shipping_phone;
    const customerEmail = order?.customer_email || 'E-posta bilgisi bulunmuyor';
    const currentStatusId = String(order?.status_id ?? order?.status ?? '');
    const isStatusChanged = status !== '' && status !== currentStatusId;
    const normalizedCurrentStatusTitle = normalizeStatusTitle(currentStatusTitle);
    const cancelledStatus = statusOptions.find((item) => normalizeStatusTitle(item.title).includes('iptal'));
    const isCancelled = normalizedCurrentStatusTitle.includes('iptal');
    const isDelivered = normalizedCurrentStatusTitle.includes('teslim')
        || normalizedCurrentStatusTitle.includes('tamam');
    const statusUpdatedByAdmin = order?.status_updated_by_admin_name || order?.status_updated_by_admin_email;

    const updateStatus = async ({ nextStatus = status, closeAfterUpdate = false } = {}) => {
        if (!nextStatus) {
            enqueueSnackbar('Lütfen geçerli bir durum seçin', { variant: 'warning' });
            return;
        }

        const hasStatusChanged = String(nextStatus) !== currentStatusId;

        if (!hasStatusChanged && !closeAfterUpdate) {
            return;
        }

        try {
            setSaving(true);
            const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Sipariş güncellenemedi');
            }

            const nextTitle = data.status_title
                || statusOptions.find((item) => String(item.id) === String(data.status ?? nextStatus))?.title
                || currentStatusTitle;

            setOrder((prev) => ({
                ...prev,
                ...data,
                status_id: data.status_id ?? data.status ?? nextStatus,
                status: data.status ?? nextStatus,
                status_title: nextTitle,
            }));
            setStatus(String(data.status_id ?? data.status ?? nextStatus));
            enqueueSnackbar('Sipariş durumu güncellendi', { variant: 'success' });

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
        if (!cancelledStatus) {
            enqueueSnackbar('İptal durumu bulunamadı', { variant: 'error' });
            return;
        }

        await updateStatus({ nextStatus: String(cancelledStatus.id) });
    };

    const handleBack = () => {
        router.push('/admin/orders');
    };

    const handleSaveAndClose = () => {
        if (!isStatusChanged) {
            router.push('/admin/orders');
            return;
        }

        updateStatus({ closeAfterUpdate: true });
    };

    if (loading) {
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
            <div className="flex w-full max-w-[1240px] flex-col gap-6">
                <OrderDetailHeader
                    order={order}
                    currentStatusTitle={currentStatusTitle}
                    currentStatusClasses={currentStatusClasses}
                    saving={saving}
                    cancelledStatus={cancelledStatus}
                    isCancelled={isCancelled}
                    isDelivered={isDelivered}
                    onCancelOrder={handleCancelOrder}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="flex flex-col gap-6 xl:col-span-2">
                        <OrderItemsCard items={order.items} />
                        <OrderAdminNoteCard value={adminNote} onChange={setAdminNote} />
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
                            isStatusChanged={isStatusChanged}
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
                    onBack={handleBack}
                    onSaveAndClose={handleSaveAndClose}
                />
            </div>
        </div>
    );
}
