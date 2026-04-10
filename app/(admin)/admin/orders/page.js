'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { Button, Chip, CircularProgress, IconButton, InputBase, Paper } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import OrderTable from '@/components/admin/OrderTable';
import { formatOrderStatusLabel } from '@/lib/admin/order-display';

const STAT_CARDS = [
    {
        key: 'total',
        title: 'Total Orders',
        description: 'Overall order volume',
        icon: LocalMallOutlinedIcon,
        iconClassName: 'bg-primary/10 text-primary',
        glowClassName: 'bg-primary/5',
    },
    {
        key: 'pending',
        title: 'Pending Orders',
        description: 'Awaiting action',
        icon: HourglassTopRoundedIcon,
        iconClassName: 'bg-accent/10 text-accent',
        glowClassName: 'bg-accent/10',
    },
    {
        key: 'processing',
        title: 'Processing Orders',
        description: 'Packing and preparation',
        icon: Inventory2OutlinedIcon,
        iconClassName: 'bg-secondary/15 text-secondary',
        glowClassName: 'bg-secondary/10',
    },
    {
        key: 'completed',
        title: 'Completed Orders',
        description: 'Delivered orders',
        icon: CheckCircleOutlineRoundedIcon,
        iconClassName: 'bg-primary/15 text-primary-dark',
        glowClassName: 'bg-primary/10',
    },
];

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
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [statusFilter, setStatusFilter] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
    });
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
            if (!res.ok) throw new Error('Orders could not be loaded');
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
                if (!res.ok) throw new Error('Order statuses could not be loaded');
                const data = await res.json();
                setStatusOptions(data.statuses || []);
                setSummary(data.summary || {
                    total: data.totalOrders || 0,
                    pending: 0,
                    processing: 0,
                    completed: 0,
                });
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
                    const value = Number(summary[card.key] || 0);
                    const ratio = summary.total > 0 ? Math.round((value / summary.total) * 100) : 0;

                    return (
                        <Paper
                            key={card.key}
                            className="group !relative !overflow-hidden !rounded-3xl !border !border-primary/10 !bg-white !p-6 !shadow-sm"
                        >
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-text-muted">{card.title}</p>
                                    <h2 className="mt-2 font-display text-3xl font-bold text-text-main">{value.toLocaleString('en-US')}</h2>
                                    <p className="mt-2 inline-flex rounded-full bg-background-light px-2.5 py-1 text-xs font-medium text-text-muted">
                                        {ratio}% share
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
                                placeholder="Search by order no or customer name..."
                                className="w-full text-sm text-text-main"
                                inputProps={{ 'aria-label': 'Search orders' }}
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
                                    label={`All (${summary.total.toLocaleString('en-US')})`}
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
                                            label={`${formatOrderStatusLabel(status.title || status.id)} (${Number(status.count || 0).toLocaleString('en-US')})`}
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
                            <h3 className="font-display text-xl font-bold text-text-main">No orders matched the current filters</h3>
                            <p className="text-sm text-text-muted">Adjust the search term or status filter to widen the list.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <OrderTable orders={orders} variant="orders" />

                        <div className="flex flex-col gap-3 border-t border-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-text-muted">
                                Showing {orders.length > 0 ? ((pagination.page - 1) * 10) + 1 : 0}-{((pagination.page - 1) * 10) + orders.length} of {pagination.total.toLocaleString('en-US')} orders
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
