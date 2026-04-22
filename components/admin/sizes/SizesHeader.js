'use client';

import { Button } from '@mui/material';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';

export default function SizesHeader({ onCreate, canMutate }) {
    return (
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Size Management
                </h2>
                <p className="mt-1 font-medium text-slate-500">
                    Manage reusable size options directly from the `sizes` table.
                </p>
            </div>

            {canMutate ? (
                <Button
                    variant="contained"
                    disableElevation
                    startIcon={<StraightenRoundedIcon className="!text-xl" />}
                    onClick={onCreate}
                    sx={{ textTransform: 'none' }}
                    className="!rounded-xl !bg-primary !px-6 !py-3 !font-extrabold !text-slate-900 !shadow-lg !shadow-primary/20 transition-all hover:!-translate-y-0.5 hover:!bg-primary-dark active:!translate-y-0"
                >
                    New Size
                </Button>
            ) : null}
        </div>
    );
}
