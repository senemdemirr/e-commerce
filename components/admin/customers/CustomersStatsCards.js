'use client';

import { Paper } from '@mui/material';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';

const STAT_CARDS = [
    {
        key: 'total',
        title: 'Toplam Müşteri',
        description: 'Portföydeki toplam kullanıcı sayısı',
        icon: Groups2RoundedIcon,
        iconClassName: 'bg-primary/10 text-primary-dark',
    },
    {
        key: 'newThisMonth',
        title: 'Yeni Müşteriler',
        description: 'Bu ay sisteme katılan kullanıcılar',
        icon: PersonAddAlt1RoundedIcon,
        iconClassName: 'bg-secondary/20 text-secondary',
    },
    {
        key: 'active',
        title: 'Aktif Alıcılar',
        description: 'En az bir sipariş veren müşteriler',
        icon: MarkEmailReadRoundedIcon,
        iconClassName: 'bg-accent/15 text-accent',
    },
    {
        key: 'prospect',
        title: 'Pasif Müşteriler',
        description: 'Henüz sipariş vermemiş hesaplar',
        icon: PersonOffRoundedIcon,
        iconClassName: 'bg-slate-100 text-slate-500',
    },
];

export default function CustomersStatsCards({ summary }) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map((card) => {
                const Icon = card.icon;
                const value = Number(summary[card.key] || 0);
                const ratio = summary.total > 0 ? Math.round((value / summary.total) * 100) : 0;

                return (
                    <Paper
                        key={card.key}
                        className="!relative !overflow-hidden !rounded-[28px] !border !border-primary/10 !bg-white !p-5 !shadow-none"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-text-muted">{card.title}</p>
                                <h2 className="mt-3 font-display text-3xl font-black text-text-main">
                                    {value.toLocaleString('tr-TR')}
                                </h2>
                                <p className="mt-3 inline-flex rounded-full bg-background-light px-2.5 py-1 text-xs font-semibold text-text-muted">
                                    %{ratio} portföy payı
                                </p>
                                <p className="mt-4 text-xs leading-5 text-text-muted">{card.description}</p>
                            </div>

                            <div className={`flex size-12 items-center justify-center rounded-2xl ${card.iconClassName}`}>
                                <Icon />
                            </div>
                        </div>
                    </Paper>
                );
            })}
        </div>
    );
}
