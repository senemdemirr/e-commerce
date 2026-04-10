'use client';

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';

const TopCategories = ({ topCategories }) => {
    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fashion') || lower.includes('clothes')) return <CheckroomIcon sx={{ fontSize: 14 }} />;
        if (lower.includes('home') || lower.includes('decor')) return <HomeIcon sx={{ fontSize: 14 }} />;
        if (lower.includes('electronics') || lower.includes('device')) return <DevicesIcon sx={{ fontSize: 14 }} />;
        return <ShoppingBagIcon sx={{ fontSize: 14 }} />;
    };

    const getIconColors = (index) => {
        const colors = [
            { bg: 'bg-primary/20', text: 'text-primary' },
            { bg: 'bg-accent-champagne/20', text: 'text-accent-champagne' },
            { bg: 'bg-secondary/20', text: 'text-secondary' }
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="min-w-0 rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-lg font-bold mb-4 font-display">Top Categories</h2>
            <div className="space-y-4">
                {topCategories.map((cat, index) => {
                    const colors = getIconColors(index);
                    return (
                        <div key={cat.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className={`size-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
                                        {getCategoryIcon(cat.name)}
                                    </div>
                                    <span className="truncate text-sm font-medium font-body">{cat.name}</span>
                                </div>
                                <span className="text-sm font-bold font-display">${cat.amount}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopCategories;
