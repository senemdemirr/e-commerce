'use client';

import { Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export default function SubcategoriesHeader({
    totalProducts,
    categoriesCount,
    loading,
    hasCategories,
    onCreate,
}) {
    return (
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                        Sub-Categories Management
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                        Manage product sub-hierarchies, keep parent mappings clean and monitor which groups are actively populated with products.
                    </p>
                </div>
            </div>

            <Button
                variant="contained"
                disableElevation
                startIcon={<AddRoundedIcon className="!text-xl" />}
                onClick={onCreate}
                disabled={loading || !hasCategories}
                sx={{ textTransform: 'none' }}
                className="!rounded-xl !bg-primary !px-6 !py-3 !font-extrabold !text-slate-900 !shadow-lg !shadow-primary/20 transition-all hover:!-translate-y-0.5 hover:!bg-primary-dark active:!translate-y-0 disabled:!bg-slate-200 disabled:!text-slate-500"
            >
                New Sub-Category
            </Button>
        </div>
    );
}
