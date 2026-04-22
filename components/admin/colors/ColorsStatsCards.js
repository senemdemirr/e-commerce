'use client';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export default function ColorsStatsCards({
    totalColors,
    usedColors,
    unusedColors,
}) {
    const cards = [
        {
            title: 'Total Colors',
            value: totalColors,
            icon: PaletteRoundedIcon,
            iconClassName: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
            title: 'In Use',
            value: usedColors,
            icon: Inventory2RoundedIcon,
            iconClassName: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            title: 'Unused',
            value: unusedColors,
            icon: AutoAwesomeRoundedIcon,
            iconClassName: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
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
