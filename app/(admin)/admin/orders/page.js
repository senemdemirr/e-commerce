'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Box, Button, Chip, CircularProgress, IconButton, InputBase, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const STAT_CARDS = [
    {
        key: 'total',
        title: 'Toplam Sipariş',
        description: 'Genel sipariş hacmi',
        icon: LocalMallOutlinedIcon,
        iconClassName: 'bg-primary/10 text-primary',
        glowClassName: 'bg-primary/5',
    },
    {
        key: 'pending',
        title: 'Bekleyen Siparişler',
        description: 'Aksiyon bekleyenler',
        icon: HourglassTopRoundedIcon,
        iconClassName: 'bg-accent/10 text-accent',
        glowClassName: 'bg-accent/10',
    },
    {
        key: 'processing',
        title: 'Hazırlananlar',
        description: 'Paketleme ve hazırlık',
        icon: Inventory2OutlinedIcon,
        iconClassName: 'bg-secondary/15 text-secondary',
        glowClassName: 'bg-secondary/10',
    },
    {
        key: 'completed',
        title: 'Tamamlananlar',
        description: 'Teslim edilen siparişler',
        icon: CheckCircleOutlineRoundedIcon,
        iconClassName: 'bg-primary/15 text-primary-dark',
        glowClassName: 'bg-primary/10',
    },
];

function normalizeStatusValue(value) {
    return String(value || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, '_');
}

function getStatusTone(order) {
    const normalized = normalizeStatusValue(order.status_title || order.status);

    if (['tamamlandı', 'teslim_edildi'].includes(normalized)) {
        return 'bg-primary/15 text-primary border-primary/15';
    }
    if (['hazırlanıyor', 'hazır'].includes(normalized)) {
        return 'bg-secondary/15 text-secondary border-secondary/15';
    }
    if (['kargoda'].includes(normalized)) {
        return 'bg-text-dark/10 text-text-dark border-text-dark/10';
    }
    if (['iptal_edildi', 'iade_talebi'].includes(normalized)) {
        return 'bg-accent/15 text-accent border-accent/15';
    }

    return 'bg-accent/10 text-accent border-accent/10';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    });
}

function getInitials(name) {
    const parts = String(name || 'Müşteri')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    return parts.map((part) => part[0]).join('').toUpperCase();
}

function findStatusCount(statuses, aliases) {
    return statuses.reduce((total, item) => {
        const normalized = normalizeStatusValue(item.title);
        return aliases.includes(normalized) ? total + Number(item.count || 0) : total;
    }, 0);
}

function getStatCardValue(statuses, totalOrders, key) {
    if (key === 'total') {
        return totalOrders;
    }

    if (key === 'pending') {
        return findStatusCount(statuses, ['beklemede', 'sipariş_alındı']);
    }

    if (key === 'processing') {
        return findStatusCount(statuses, ['hazırlanıyor', 'hazır']);
    }

    return findStatusCount(statuses, ['tamamlandı', 'teslim_edildi']);
}

function buildPaginationItems(page, totalPages) {
    if (totalPages <= 1) return [1];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const items = new Set([1, page - 1, page, page + 1, totalPages]);
    const ordered = [...items].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);

    return ordered.flatMap((item, index) => {
        const previous = ordered[index - 1];
        if (index > 0 && item - previous > 1) {
            return ['ellipsis', item];
        }
        return [item];
    });
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [statusFilter, setStatusFilter] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchOrders = useCallback(async (page = 1, status = '', search = '') => {
        try {
            setLoading(true);
            const query = new URLSearchParams({ page, limit: 10 });
            if (status) query.append('status', status);
            if (search) query.append('search', search);

            const res = await fetch(`/api/admin/orders?${query.toString()}`, {
                headers: { role: 'admin' },
            });
            if (!res.ok) throw new Error('Siparişler getirilemedi');
            const data = await res.json();
            
            setOrders(data.orders || []);
            setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await fetch('/api/admin/order-statuses', {
                    headers: { role: 'admin' },
                });
                if (!res.ok) throw new Error('Sipariş durumları getirilemedi');
                const data = await res.json();
                setStatusOptions(data.statuses || []);
                setTotalOrders(data.totalOrders || 0);
            } catch (error) {
                enqueueSnackbar(error.message, { variant: 'error' });
            }
        };

        fetchStatuses();
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchOrders(1, statusFilter, debouncedSearch);
    }, [debouncedSearch, fetchOrders, statusFilter]);

    const paginationItems = buildPaginationItems(pagination.page, pagination.totalPages);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {STAT_CARDS.map((card) => {
                    const Icon = card.icon;
                    const value = getStatCardValue(statusOptions, totalOrders, card.key);
                    const ratio = totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0;

                    return (
                        <Paper
                            key={card.key}
                            className="group !relative !overflow-hidden !rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm"
                        >
                            <div className={`absolute -right-6 -top-6 size-24 rounded-full ${card.glowClassName} transition-transform duration-300 group-hover:scale-110`} />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-text-muted">{card.title}</p>
                                    <h2 className="mt-2 font-display text-3xl font-bold text-text-main">{value.toLocaleString('tr-TR')}</h2>
                                    <p className="mt-2 inline-flex rounded-full bg-background-light px-2.5 py-1 text-xs font-medium text-text-muted">
                                        %{ratio} pay
                                    </p>
                                    <p className="mt-4 text-xs text-text-muted">{card.description}</p>
                                </div>
                                <div className={`flex size-12 items-center justify-center rounded-2xl ${card.iconClassName}`}>
                                    <Icon />
                                </div>
                            </div>
                        </Paper>
                    );
                })}
            </div>

            <Paper className="!overflow-hidden !rounded-3xl !border !border-primary/10 !bg-white !shadow-sm">
                <div className="border-b border-primary/10 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <Paper className="flex w-full items-center gap-3 !rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !shadow-none xl:max-w-md">
                            <SearchRoundedIcon className="text-text-muted" />
                            <InputBase
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Sipariş no veya müşteri adı ile ara..."
                                className="w-full text-sm text-text-main"
                                inputProps={{ 'aria-label': 'Sipariş ara' }}
                            />
                        </Paper>

                        <div
                            className="scrollbar-hide w-full overflow-x-auto pb-2 xl:w-auto xl:max-w-full"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                        >
                            <div
                                className="flex min-w-max flex-nowrap items-center gap-2 pr-1"
                            >
                                <Chip
                                    clickable
                                    label={`All (${totalOrders.toLocaleString('tr-TR')})`}
                                    onClick={() => setStatusFilter('')}
                                    className={statusFilter === ''
                                        ? '!shrink-0 !rounded-xl !bg-primary !font-semibold !text-white'
                                        : '!shrink-0 !rounded-xl !border !border-primary/10 !bg-background-light !font-medium !text-text-muted'}
                                />
                                {statusOptions.map((status) => {
                                    return (
                                        <Chip
                                            key={status.id || status.title}
                                            clickable
                                            label={`${status.title || status.id} (${Number(status.count || 0).toLocaleString('tr-TR')})`}
                                            onClick={() => setStatusFilter(status.title || '')}
                                            className={statusFilter === (status.title || '')
                                                ? '!shrink-0 !rounded-xl !bg-primary !font-semibold !text-white'
                                                : '!shrink-0 !rounded-xl !border !border-primary/10 !bg-background-light !font-medium !text-text-muted'}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-[340px] items-center justify-center">
                        <CircularProgress className="!text-primary" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex min-h-[340px] flex-col items-center justify-center gap-4 px-6 text-center">
                        <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                            <ReceiptLongOutlinedIcon fontSize="large" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-display text-xl font-bold text-text-main">Kriterlere uygun sipariş bulunamadı</h3>
                            <p className="text-sm text-text-muted">Arama veya durum filtresini değiştirerek listeyi genişletebilirsiniz.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <TableContainer>
                            <Table className="min-w-[860px]">
                                <TableHead>
                                    <TableRow className="bg-background-light">
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Sipariş No</TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Müşteri</TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Tarih</TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Toplam</TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Durum</TableCell>
                                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-right !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">İşlem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow
                                            key={order.order_number}
                                            className="transition-colors hover:bg-background-light/80"
                                        >
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4">
                                                <div className="space-y-1">
                                                    <p className="font-display text-sm font-bold text-text-main">#{order.order_number}</p>
                                                    <p className="text-xs text-text-muted">Sipariş kaydı</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/10 text-sm font-bold text-secondary">
                                                        {getInitials(order.shipping_full_name)}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold text-text-main">{order.shipping_full_name || 'Misafir Müşteri'}</p>
                                                        <p className="text-xs text-text-muted">Sipariş sahibi</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-sm !text-text-muted">
                                                {formatDate(order.created_at)}
                                            </TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-sm !font-semibold !text-text-main">
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4">
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(order)}`}>
                                                    {order.status_title || order.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Tooltip title="Siparişi görüntüle">
                                                        <IconButton
                                                            onClick={() => router.push(`/admin/orders/${encodeURIComponent(order.order_number)}`)}
                                                            className="!rounded-xl !text-text-muted hover:!bg-primary/10 hover:!text-primary"
                                                        >
                                                            <VisibilityOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className="flex flex-col gap-3 border-t border-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-text-muted">
                                {pagination.total.toLocaleString('tr-TR')} siparişten{' '}
                                {orders.length > 0 ? ((pagination.page - 1) * 10) + 1 : 0}-{((pagination.page - 1) * 10) + orders.length} arası gösteriliyor
                            </p>

                            <div className="flex items-center gap-1 self-start sm:self-auto">
                                <IconButton
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchOrders(pagination.page - 1, statusFilter, debouncedSearch)}
                                    className="!rounded-xl !text-text-muted disabled:!opacity-40"
                                >
                                    <KeyboardArrowLeftRoundedIcon />
                                </IconButton>

                                {paginationItems.map((item, index) => {
                                    if (item === 'ellipsis') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-muted">...</span>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={item}
                                            onClick={() => fetchOrders(item, statusFilter, debouncedSearch)}
                                            className={pagination.page === item
                                                ? '!min-w-0 !rounded-xl !bg-primary !px-3 !py-2 !text-xs !font-bold !text-white'
                                                : '!min-w-0 !rounded-xl !px-3 !py-2 !text-xs !font-bold !text-text-muted hover:!bg-background-light'}
                                        >
                                            {item}
                                        </Button>
                                    );
                                })}

                                <IconButton
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchOrders(pagination.page + 1, statusFilter, debouncedSearch)}
                                    className="!rounded-xl !text-text-muted disabled:!opacity-40"
                                >
                                    <KeyboardArrowRightRoundedIcon />
                                </IconButton>
                            </div>
                        </div>
                    </>
                )}
            </Paper>
        </div>
    );
}
