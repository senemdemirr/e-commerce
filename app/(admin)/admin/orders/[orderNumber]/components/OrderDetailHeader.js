'use client';

import Link from 'next/link';
import { Button, Chip, Paper } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import OrderPdfDownloadButton from '../OrderPdfDownloadButton';
import { formatDate } from '@/lib/admin/order-display';

export default function OrderDetailHeader({
    order,
    currentStatusTitle,
    currentStatusClasses,
    saving,
    cancelledStatus,
    isStatusLocked,
    onCancelOrder,
}) {
    return (
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
                        <OrderPdfDownloadButton order={order} currentStatusTitle={currentStatusTitle} />
                        <Button
                            onClick={onCancelOrder}
                            disabled={saving || !cancelledStatus || isStatusLocked}
                            startIcon={<CancelOutlinedIcon />}
                            className="!rounded-2xl !border !border-accent/20 !bg-red-500 !px-4 !py-2.5 !font-bold !text-white hover:!bg-red-600/5"
                        >
                            Siparişi İptal Et
                        </Button>
                    </div>
                </div>
            </Paper>
        </div>
    );
}
