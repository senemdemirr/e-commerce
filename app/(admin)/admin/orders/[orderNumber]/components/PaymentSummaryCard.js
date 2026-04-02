'use client';

import { Divider, Paper } from '@mui/material';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import {
    formatCurrency,
    formatDate,
    formatPaymentMethod,
    formatPaymentStatus,
} from '../orderDetail.utils';

export default function PaymentSummaryCard({ order }) {
    return (
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
    );
}
