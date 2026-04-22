'use client';

import { CircularProgress, IconButton } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function formatDate(value) {
    if (!value) {
        return 'No date';
    }

    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export default function ColorsTable({
    loading,
    visibleColors,
    totalColors,
    startIndex,
    pageSize,
    pageNumbers,
    safePage,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    canMutate,
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                    <CircularProgress className="!text-primary" />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Color
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Product Usage
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Variant Usage
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {visibleColors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="mx-auto max-w-sm">
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                    No colors yet
                                                </p>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Create your first reusable color to support product variation setup.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : visibleColors.map((color) => (
                                    <tr
                                        key={color.id}
                                        className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="size-12 rounded-xl border border-slate-200 shadow-sm dark:border-slate-700"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                <div>
                                                    <div className="text-base font-bold text-slate-900 dark:text-white">
                                                        {color.name}
                                                    </div>
                                                    <div className="font-mono text-xs font-bold text-primary">
                                                        {color.hex}
                                                    </div>
                                                    <div className="mt-1 text-xs font-medium text-slate-400">
                                                        Added {formatDate(color.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                {formatNumber(color.product_count)} products
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                {formatNumber(color.variant_count)} variants
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span
                                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                                        color.is_used
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${
                                                            color.is_used ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                                                        }`}
                                                    />
                                                    {color.is_used ? 'In Use' : 'Unused'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canMutate ? (
                                                    <>
                                                        <IconButton
                                                            onClick={() => onEdit(color)}
                                                            title="Edit"
                                                            className="!rounded-lg !p-2 !text-slate-400 transition-all hover:!bg-primary/5 hover:!text-primary"
                                                        >
                                                            <EditRoundedIcon className="!text-lg" />
                                                        </IconButton>

                                                        <IconButton
                                                            onClick={() => onDelete(color)}
                                                            title={color.is_used ? 'This color is in use' : 'Delete'}
                                                            className="!rounded-lg !p-2 !text-slate-400 transition-all hover:!bg-red-50 hover:!text-red-500"
                                                        >
                                                            <DeleteRoundedIcon className="!text-lg" />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        Read only
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500">
                            Showing {totalColors === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalColors)} of {formatNumber(totalColors)} colors
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onPageChange(Math.max(1, safePage - 1))}
                                disabled={safePage <= 1}
                                className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                            >
                                <ChevronLeftRoundedIcon className="!text-lg" />
                            </button>

                            {pageNumbers.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => onPageChange(pageNumber)}
                                    className={pageNumber === safePage
                                        ? 'flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-slate-900'
                                        : 'flex size-8 items-center justify-center rounded-lg text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800'}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                                disabled={safePage >= totalPages}
                                className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                            >
                                <ChevronRightRoundedIcon className="!text-lg" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
