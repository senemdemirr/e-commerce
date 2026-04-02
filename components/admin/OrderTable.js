'use client';

import { useRouter } from 'next/navigation';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
    formatCurrency,
    formatDashboardCurrency,
    formatDashboardDate,
    formatTableDate,
    getCustomerName,
    getInitials,
    getOrderStatusLabel,
    getStatusClasses,
} from '@/lib/admin/order-display';

export default function OrderTable({ orders = [], variant = 'orders' }) {
    const router = useRouter();

    return (
        <TableContainer>
            <Table className="min-w-[860px]">
                <TableHead>
                    <TableRow className="bg-background-light">
                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Order ID</TableCell>
                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Customer</TableCell>
                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Date</TableCell>
                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Total</TableCell>
                        <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Status</TableCell>
                        {variant === 'orders' && (
                            <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-right !text-xs !font-semibold !uppercase !tracking-[0.18em] !text-text-muted">Actions</TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => {
                        const customerName = getCustomerName(order);
                        const statusLabel = getOrderStatusLabel(order);
                        const statusClasses = getStatusClasses(statusLabel);
                        const orderDate = variant === 'dashboard'
                            ? formatDashboardDate(order.created_at)
                            : formatTableDate(order.created_at);
                        const totalAmount = variant === 'dashboard'
                            ? formatDashboardCurrency(order.total_amount)
                            : formatCurrency(order.total_amount);

                        return (
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
                                            {getInitials(customerName)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-text-main">{customerName}</p>
                                            <p className="text-xs text-text-muted">Sipariş sahibi</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-sm !text-text-muted">
                                    {orderDate}
                                </TableCell>
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-sm !font-semibold !text-text-main">
                                    {totalAmount}
                                </TableCell>
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4">
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses.badge}`}>
                                        {statusLabel}
                                    </span>
                                </TableCell>
                                {variant === 'orders' && (
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
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
