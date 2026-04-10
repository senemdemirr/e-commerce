'use client';

import { CircularProgress, IconButton } from '@mui/material';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export default function SubcategoriesTable({
    loading,
    filters,
    activeFilter,
    onFilterChange,
    filteredCount,
    visibleSubcategories,
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
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-slate-900">
            <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {filters.map((item) => {
                        const isActive = activeFilter === item.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => onFilterChange(item.value)}
                                className={isActive
                                    ? 'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-slate-900 shadow-sm'
                                    : 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-primary/10 hover:text-slate-900 dark:hover:text-slate-100'}
                            >
                                <span>{item.label}</span>
                                <span className={isActive ? 'text-slate-900/70' : 'text-slate-400'}>
                                    {formatNumber(item.count)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {formatNumber(filteredCount)} entries in the current view
                </p>
            </div>

            {loading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                    <CircularProgress className="!text-primary" />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Sub-Category Name
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Parent Category
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Slug
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-primary/10">
                                {visibleSubcategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="mx-auto max-w-md">
                                                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                    <AppsRoundedIcon className="!text-3xl" />
                                                </div>
                                                <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-50">
                                                    No sub-categories found
                                                </h3>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    Adjust the current filter or create a new sub-category to start organizing your catalog tree.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : visibleSubcategories.map((subcategory) => (
                                    <tr
                                        key={subcategory.id}
                                        className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <AppsRoundedIcon />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                        {subcategory.name}
                                                    </p>
                                                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        {formatNumber(subcategory.product_count)} products assigned
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                                                    {subcategory.category_name}
                                                </span>
                                                <p className="text-xs font-mono text-slate-400">
                                                    /{subcategory.category_slug}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                                /{subcategory.category_slug}/{subcategory.slug}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${subcategory.status.chipClassName}`}
                                                >
                                                    <span className={`size-2 rounded-full ${subcategory.status.dotClassName}`} />
                                                    {subcategory.status.label}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canMutate ? (
                                                    <>
                                                        <IconButton
                                                            onClick={() => onEdit(subcategory)}
                                                            title="Edit"
                                                            className="!rounded-lg !p-2 !text-slate-400 transition-colors hover:!bg-primary/10 hover:!text-primary"
                                                        >
                                                            <EditRoundedIcon className="!text-lg" />
                                                        </IconButton>

                                                        <IconButton
                                                            onClick={() => onDelete(subcategory)}
                                                            title="Delete"
                                                            className="!rounded-lg !p-2 !text-slate-400 transition-colors hover:!bg-red-50 hover:!text-red-500"
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

                    <div className="flex flex-col gap-4 border-t border-primary/10 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-slate-100">
                                {filteredCount === 0 ? 0 : startIndex + 1}
                            </span> to <span className="font-bold text-slate-900 dark:text-slate-100">
                                {Math.min(startIndex + pageSize, filteredCount)}
                            </span> of <span className="font-bold text-slate-900 dark:text-slate-100">
                                {formatNumber(filteredCount)}
                            </span> results
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onPageChange(Math.max(1, safePage - 1))}
                                disabled={safePage <= 1}
                                className="flex size-10 items-center justify-center rounded-lg border border-primary/20 text-slate-500 transition-colors hover:bg-primary/10 disabled:opacity-40"
                            >
                                <ChevronLeftRoundedIcon className="!text-lg" />
                            </button>

                            {pageNumbers.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => onPageChange(pageNumber)}
                                    className={pageNumber === safePage
                                        ? 'flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-bold text-slate-900'
                                        : 'flex h-10 min-w-10 items-center justify-center rounded-lg border border-primary/20 px-3 text-sm font-bold text-slate-500 transition-colors hover:bg-primary/10'}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                                disabled={safePage >= totalPages}
                                className="flex size-10 items-center justify-center rounded-lg border border-primary/20 text-slate-500 transition-colors hover:bg-primary/10 disabled:opacity-40"
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
