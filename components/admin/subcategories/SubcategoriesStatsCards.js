'use client';

import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export default function SubcategoriesStatsCards({
    totalSubcategories,
    activeSubcategories,
    inactiveSubcategories,
}) {
    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary/10 to-transparent" />
                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Sub-Categories</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                            {formatNumber(totalSubcategories)}
                        </p>
                    </div>

                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <AppsRoundedIcon />
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-green-200/40 to-transparent dark:from-green-900/20" />
                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Groups</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                            {formatNumber(activeSubcategories)}
                        </p>
                    </div>

                    <div className="flex size-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                        <Inventory2RoundedIcon />
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-200/60 to-transparent dark:from-slate-800/60" />
                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Inactive Groups</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">
                            {formatNumber(inactiveSubcategories)}
                        </p>
                    </div>

                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        <FolderOpenRoundedIcon />
                    </div>
                </div>
            </div>
        </div>
    );
}
