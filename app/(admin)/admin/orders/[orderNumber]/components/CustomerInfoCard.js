'use client';

import { Avatar, Paper } from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import { formatText, getInitials } from '../orderDetail.utils';

export default function CustomerInfoCard({
    order,
    customerName,
    customerEmail,
    customerPhone,
}) {
    return (
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
    );
}
