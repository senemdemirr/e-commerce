'use client';

import { CircularProgress, IconButton } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CategoryIcon from '@mui/icons-material/Category';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function getCategoryStatus(category) {
    const isActive = Number(category?.activate ?? 1) === 1;

    if (isActive) {
        return {
            label: 'Active',
            chipClassName: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            dotClassName: 'bg-green-500',
        };
    }

    return {
        label: 'Inactive',
        chipClassName: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        dotClassName: 'bg-slate-400',
    };
}

export default function CategoriesTable({
    loading,
    visibleCategories,
    totalCategories,
    startIndex,
    pageSize,
    pageNumbers,
    safePage,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
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
                                        Category Name &amp; Slug
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                        Products
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
                                {visibleCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="mx-auto max-w-sm">
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                    No categories yet
                                                </p>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Create your first category to start building the catalog structure.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : visibleCategories.map((category) => {
                                    const status = getCategoryStatus(category);

                                    return (
                                        <tr
                                            key={category.id}
                                            className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-800">
                                                        <CategoryIcon />
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-bold text-slate-900 dark:text-white">
                                                            {category.name}
                                                        </div>
                                                        <div className="font-mono text-xs font-bold text-primary">
                                                            /{category.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                    {formatNumber(category.product_count)} items
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span
                                                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${status.chipClassName}`}
                                                    >
                                                        <span
                                                            className={`size-1.5 rounded-full ${status.dotClassName} ${status.label === 'Active' ? 'animate-pulse' : ''}`}
                                                        />
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton
                                                        onClick={() => onEdit(category)}
                                                        title="Edit"
                                                        className="!rounded-lg !p-2 !text-slate-400 transition-all hover:!bg-primary/5 hover:!text-primary"
                                                    >
                                                        <EditRoundedIcon className="!text-lg" />
                                                    </IconButton>

                                                    <IconButton
                                                        onClick={() => onDelete(category)}
                                                        title="Delete"
                                                        className="!rounded-lg !p-2 !text-slate-400 transition-all hover:!bg-red-50 hover:!text-red-500"
                                                    >
                                                        <DeleteRoundedIcon className="!text-lg" />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500">
                            Showing {totalCategories === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalCategories)} of {formatNumber(totalCategories)} categories
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
