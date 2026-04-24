'use client';

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export default function CampaignsStatsCards({
    totalCampaigns,
    activeCampaigns,
    scheduledCampaigns,
    inactiveCampaigns,
}) {
    const cards = [
        {
            title: 'Total Campaigns',
            value: totalCampaigns,
            icon: CampaignRoundedIcon,
            iconClassName: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
            title: 'Active',
            value: activeCampaigns,
            icon: EventAvailableRoundedIcon,
            iconClassName: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            title: 'Scheduled',
            value: scheduledCampaigns,
            icon: ScheduleRoundedIcon,
            iconClassName: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        },
        {
            title: 'Inactive',
            value: inactiveCampaigns,
            icon: ToggleOffRoundedIcon,
            iconClassName: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.title}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex size-12 items-center justify-center rounded-xl ${card.iconClassName}`}>
                                <Icon />
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {formatNumber(card.value)}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
