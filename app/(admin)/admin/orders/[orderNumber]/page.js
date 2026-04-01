'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Button, Chip, CircularProgress, Divider, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

function normalizeStatusTitle(value) {
    return String(value || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, '_');
}

function getStatusClasses(title) {
    const normalized = normalizeStatusTitle(title);

    if (normalized.includes('iptal')) {
        return {
            badge: 'bg-accent/15 text-accent border-accent/20',
            panel: 'bg-accent/10 border-accent/20 text-accent',
            icon: <CancelOutlinedIcon className="!text-accent" />,
        };
    }

    if (normalized.includes('teslim') || normalized.includes('tamam')) {
        return {
            badge: 'bg-primary/15 text-primary border-primary/20',
            panel: 'bg-primary/10 border-primary/20 text-primary',
            icon: <CheckCircleOutlineRoundedIcon className="!text-primary" />,
        };
    }

    if (normalized.includes('kargo')) {
        return {
            badge: 'bg-text-dark/10 text-text-dark border-text-dark/10',
            panel: 'bg-text-dark/5 border-text-dark/10 text-text-dark',
            icon: <LocalShippingOutlinedIcon className="!text-text-dark" />,
        };
    }

    if (normalized.includes('hazır') || normalized.includes('işlen') || normalized.includes('hazırlan')) {
        return {
            badge: 'bg-secondary/15 text-secondary border-secondary/20',
            panel: 'bg-secondary/10 border-secondary/20 text-secondary',
            icon: <Inventory2OutlinedIcon className="!text-secondary" />,
        };
    }

    return {
        badge: 'bg-primary/10 text-primary border-primary/15',
        panel: 'bg-primary/10 border-primary/20 text-primary',
        icon: <ScheduleRoundedIcon className="!text-primary" />,
    };
}

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatText(value, fallback = '-') {
    return value ? String(value) : fallback;
}

function formatPaymentMethod(method) {
    const normalized = String(method || '').toLowerCase();

    if (normalized === 'credit_card') {
        return 'Kredi Kartı';
    }

    return formatText(method);
}

function formatPaymentStatus(status) {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'completed') {
        return 'Tamamlandı';
    }

    if (normalized === 'pending') {
        return 'Beklemede';
    }

    if (normalized === 'failed') {
        return 'Başarısız';
    }

    return formatText(status);
}

function getInitials(name) {
    const words = String(name || 'Müşteri')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    return words.map((word) => word[0]).join('').toUpperCase();
}

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
                setStatus(String(orderData.status ?? ''));
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

    const currentStatusOption = statusOptions.find((item) => String(item.id) === String(order?.status));
    const selectedStatusOption = statusOptions.find((item) => String(item.id) === String(status));
    const currentStatusTitle = currentStatusOption?.title
        || order?.status_title
        || 'Durum seçilmedi';
    const selectedStatusTitle = selectedStatusOption?.title || currentStatusTitle;
    const currentStatusClasses = getStatusClasses(currentStatusTitle);
    const selectedStatusClasses = getStatusClasses(selectedStatusTitle);
    const itemCount = order?.items?.length || 0;
    const customerName = order?.customer_name?.trim() || order?.shipping_full_name || 'Misafir Müşteri';
    const customerPhone = order?.customer_phone || order?.shipping_phone;
    const customerEmail = order?.customer_email || 'E-posta bilgisi bulunmuyor';
    const currentStatusId = String(order?.status ?? '');
    const isStatusChanged = status !== '' && status !== currentStatusId;
    const cancelledStatus = statusOptions.find((item) => normalizeStatusTitle(item.title).includes('iptal'));
    const isCancelled = normalizeStatusTitle(currentStatusTitle).includes('iptal');

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
                status: data.status ?? nextStatus,
                status_title: nextTitle,
            }));
            setStatus(String(data.status ?? nextStatus));
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
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-1 text-sm text-text-muted">
                        <span>Panel</span>
                        <ChevronRightRoundedIcon className="!text-sm" />
                        <Link href="/admin/orders" className="hover:text-text-main">Siparişler</Link>
                        <ChevronRightRoundedIcon className="!text-sm" />
                        <span className="font-semibold text-primary">#{order.order_number}</span>
                    </div>

                    <Paper className="!overflow-hidden !rounded-[28px] !border !border-primary/10 !bg-gradient-to-br from-white via-primary/5 to-accent/10 !shadow-sm">
                        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="absolute -right-10 -top-8 size-32 rounded-full bg-primary/10 blur-3xl" />
                            <div className="absolute left-1/3 top-1/2 size-28 rounded-full bg-accent/10 blur-3xl" />

                            <div className="relative z-[1] flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Chip
                                        label={currentStatusTitle}
                                        className={`!rounded-full !border !px-3 !font-semibold ${currentStatusClasses.badge}`}
                                    />
                                    <Chip
                                        label={`Oluşturulma: ${formatDate(order.created_at)}`}
                                        className="!rounded-full !bg-white/80 !px-2 !font-medium !text-text-main"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <h1 className="font-display text-3xl font-black tracking-tight text-text-main sm:text-4xl">
                                        Sipariş Düzenleme: <span className="text-primary">#{order.order_number}</span>
                                    </h1>
                                    <p className="text-sm font-medium text-text-muted">
                                        Ödeme, teslimat ve sipariş akışını tek ekrandan yönetin.
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-[1] flex flex-wrap gap-3">
                                <Button
                                    onClick={() => window.print()}
                                    startIcon={<PrintOutlinedIcon />}
                                    className="!rounded-2xl !border !border-primary/10 !bg-white !px-4 !py-2.5 !font-bold !text-text-main hover:!bg-background-light"
                                >
                                    Yazdır
                                </Button>
                                <Button
                                    onClick={handleCancelOrder}
                                    disabled={saving || !cancelledStatus || isCancelled}
                                    startIcon={<CancelOutlinedIcon />}
                                    className="!rounded-2xl !border !border-accent/20 !bg-white !px-4 !py-2.5 !font-bold !text-accent hover:!bg-accent/5 disabled:!opacity-50"
                                >
                                    Siparişi İptal Et
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="flex flex-col gap-6 xl:col-span-2">
                        <Paper className="!overflow-hidden !rounded-3xl !border !border-primary/10 !bg-white !shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 px-6 py-5">
                                <div>
                                    <h2 className="font-display text-xl font-bold text-text-main">Sipariş Edilen Ürünler</h2>
                                    <p className="mt-1 text-sm text-text-muted">Siparişe bağlı tüm kalemler</p>
                                </div>
                                <Chip
                                    label={`${itemCount} kalem ürün`}
                                    className="!rounded-full !bg-primary/10 !px-2 !font-semibold !text-primary"
                                />
                            </div>

                            <TableContainer>
                                <Table className="min-w-[760px]">
                                    <TableHead>
                                        <TableRow className="bg-background-light">
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Ürün</TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Adet</TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Birim Fiyat</TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-right !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Toplam</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.items?.map((item) => (
                                            <TableRow key={item.id} className="transition-colors hover:bg-background-light/60">
                                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-background-light">
                                                            {item.image ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.item_title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <Inventory2OutlinedIcon className="!text-text-muted" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-text-main">{item.item_title}</p>
                                                            <p className="text-xs text-text-muted">
                                                                {item.selected_size ? `Beden: ${item.selected_size}` : 'Standart'}
                                                                {item.selected_color ? ` | Renk: ${item.selected_color}` : ''}
                                                            </p>
                                                            <p className="text-xs text-text-muted">SKU: {formatText(item.sku, formatText(item.product_sku))}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !font-semibold !text-text-main">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !font-semibold !text-text-main">
                                                    {formatCurrency(item.unit_price)}
                                                </TableCell>
                                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-right !font-bold !text-text-main">
                                                    {formatCurrency(item.total_price)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
                            <div className="mb-4">
                                <h2 className="font-display text-xl font-bold text-text-main">Dahili Admin Notları</h2>
                                <p className="mt-1 text-sm text-text-muted">Bu alan yerel taslak olarak kullanılır, henüz veritabanına kaydedilmez.</p>
                            </div>
                            <TextField
                                value={adminNote}
                                onChange={(event) => setAdminNote(event.target.value)}
                                placeholder="Siparişle ilgili operasyon notu, kargo uyarısı veya ekip içi açıklama ekleyin..."
                                multiline
                                minRows={5}
                                fullWidth
                                className="!rounded-3xl"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '1rem',
                                        backgroundColor: '#f8f9fa',
                                    },
                                }}
                            />
                        </Paper>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
                            <div className="mb-5">
                                <h2 className="font-display text-xl font-bold text-text-main">Sipariş Durumu</h2>
                                <p className="mt-1 text-sm text-text-muted">`order_status` listesinden güncelleyin.</p>
                            </div>

                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 rounded-2xl border p-4 ${currentStatusClasses.panel}`}>
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/70">
                                        {currentStatusClasses.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em]">Mevcut Durum</p>
                                        <p className="mt-1 text-sm font-bold">{currentStatusTitle}</p>
                                    </div>
                                </div>

                                {isStatusChanged ? (
                                    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${selectedStatusClasses.panel}`}>
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/70">
                                            {selectedStatusClasses.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em]">Güncellenecek Durum</p>
                                            <p className="mt-1 text-sm font-bold">{selectedStatusTitle}</p>
                                        </div>
                                    </div>
                                ) : null}

                                <TextField
                                    select
                                    label="Durumu Güncelle"
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '1rem',
                                            backgroundColor: '#f8f9fa',
                                        },
                                    }}
                                    helperText={`Mevcut sipariş durumu: ${currentStatusTitle}`}
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.id} value={String(option.id)}>
                                            {option.title}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <Button
                                    onClick={() => updateStatus()}
                                    disabled={saving || !isStatusChanged}
                                    startIcon={<SaveRoundedIcon />}
                                    className="!w-full !rounded-2xl !bg-primary !py-3 !font-bold !text-white hover:!bg-primary-dark disabled:!opacity-50"
                                >
                                    {saving ? 'Güncelleniyor...' : 'Sipariş Güncelle'}
                                </Button>
                            </div>
                        </Paper>

                        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
                            <div className="mb-5">
                                <h2 className="font-display text-xl font-bold text-text-main">Müşteri Bilgileri</h2>
                                <p className="mt-1 text-sm text-text-muted">Sipariş sahibine ait iletişim ve teslimat özeti</p>
                            </div>

                            <div className="mb-6 flex items-center gap-4">
                                <Avatar className="!size-14 !bg-primary/15 !text-primary">
                                    {getInitials(customerName)}
                                </Avatar>
                                <div>
                                    <p className="text-base font-bold text-text-main">{customerName}</p>
                                    <p className="text-xs text-text-muted">Müşteri ID: {order.customer_id ? `#${order.customer_id}` : 'Misafir'}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">İletişim</p>
                                    <div className="space-y-2 text-sm text-text-main">
                                        <p className="flex items-center gap-2">
                                            <MailOutlineRoundedIcon className="!text-base !text-text-muted" />
                                            {customerEmail}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <PhoneIphoneRoundedIcon className="!text-base !text-text-muted" />
                                            {formatText(customerPhone)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Teslimat Adresi</p>
                                    <p className="flex items-start gap-2 text-sm text-text-main">
                                        <PersonOutlineRoundedIcon className="mt-0.5 !text-base !text-text-muted" />
                                        <span>
                                            {formatText(order.shipping_address)}
                                            <br />
                                            {formatText(order.shipping_district)} / {formatText(order.shipping_city)} {order.shipping_postal_code ? `(${order.shipping_postal_code})` : ''}
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Fatura Adresi</p>
                                    <p className="text-sm text-text-main">Aynı teslimat adresi üzerinden bireysel fatura</p>
                                </div>
                            </div>
                        </Paper>

                        <Paper className="!rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm">
                            <div className="mb-5">
                                <h2 className="font-display text-xl font-bold text-text-main">Ödeme Özeti</h2>
                                <p className="mt-1 text-sm text-text-muted">Siparişin finansal görünümü</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-text-muted">Ara Toplam</span>
                                    <span className="font-bold text-text-main">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-text-muted">Kargo Ücreti</span>
                                    <span className="font-bold text-text-main">{formatCurrency(order.shipping_cost)}</span>
                                </div>

                                <Divider />

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-text-main">Toplam</span>
                                    <span className="font-display text-3xl font-black text-primary">{formatCurrency(order.total_amount)}</span>
                                </div>

                                <div className="rounded-2xl bg-background-light p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-text-muted">
                                            <CreditCardRoundedIcon />
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-semibold text-text-main">{formatPaymentMethod(order.payment_method)}</p>
                                            <p className="text-text-muted">{formatPaymentStatus(order.payment_status)}</p>
                                            {(order.card_bank || order.card_family || order.card_mask) ? (
                                                <p className="text-text-muted">
                                                    {[order.card_bank, order.card_family, order.card_mask].filter(Boolean).join(' • ')}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-primary">
                                            <PaymentsOutlinedIcon />
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-semibold text-text-main">Ödeme durumu operasyonel olarak tamamlandı</p>
                                            <p className="text-text-muted">Kayıt tarihi: {formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Paper>
                    </div>
                </div>

                <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-t border-primary/10 pt-6">
                    <Button
                        onClick={() => router.push('/admin/orders')}
                        startIcon={<ArrowBackRoundedIcon />}
                        className="!rounded-2xl !border !border-primary/10 !bg-white !px-6 !py-3 !font-bold !text-text-main hover:!bg-background-light"
                    >
                        Vazgeç
                    </Button>

                    <Button
                        onClick={() => {
                            if (!isStatusChanged) {
                                router.push('/admin/orders');
                                return;
                            }

                            updateStatus({ closeAfterUpdate: true });
                        }}
                        disabled={saving}
                        startIcon={<SaveRoundedIcon />}
                        className="!rounded-2xl !bg-primary !px-6 !py-3 !font-bold !text-white hover:!bg-primary-dark disabled:!opacity-50"
                    >
                        {saving ? 'Kaydediliyor...' : 'Güncelle ve Kapat'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
