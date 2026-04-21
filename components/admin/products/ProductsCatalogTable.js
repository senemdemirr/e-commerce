import Link from 'next/link';
import { IconButton, Tooltip } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { formatCurrency, formatDate } from './productsPageHelpers';

export default function ProductsCatalogTable({ visibleProducts, onDeleteProduct, canMutate }) {
    return (
        <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-primary/10 bg-background-light">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Product
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Category
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Subcategory
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            SKU
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Price
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-primary/10">
                    {visibleProducts.map((product) => (
                        <tr key={product.id} className="transition-colors hover:bg-background-light/80">
                            <td className="px-6 py-5">
                                <div className="flex items-start gap-4">
                                    <div className={`relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${product.image ? 'bg-background-light' : 'bg-primary/10 text-primary-dark'}`}>
                                        {product.image ? (
                                            <div
                                                role="img"
                                                aria-label={product.title}
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url("${product.image}")` }}
                                            />
                                        ) : (
                                            <Inventory2RoundedIcon />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-black text-text-main">
                                                {product.title}
                                            </p>
                                            {product.isFresh ? (
                                                <span className="rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                                                    New
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {product.brand ? (
                                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary-dark">
                                                    {product.brand}
                                                </span>
                                            ) : null}
                                            <span className="text-xs font-medium text-text-muted">
                                                {product.colorCount} colors • {product.sizeCount} sizes • {product.variantCount || 0} variants • {product.detailCount} detail fields
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-text-muted">
                                            Added: {formatDate(product.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <span className="inline-flex rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-text-main">
                                        {product.categoryName}
                                    </span>
                                    <p className="text-xs font-mono text-text-muted">/{product.categorySlug || 'no-category'}</p>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <span className="inline-flex rounded-full bg-background-light px-3 py-1 text-xs font-semibold text-text-main">
                                        {product.subcategoryName}
                                    </span>
                                    <p className="text-xs font-mono text-text-muted">
                                        /{product.categorySlug || 'category'}/{product.subcategorySlug || 'subcategory'}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <span className="font-mono text-xs font-black text-text-main">
                                    {product.sku || 'Unspecified'}
                                </span>
                            </td>

                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-text-main">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                {(() => {
                                    const isActive = String(product.activate ?? 1).trim().toLowerCase();
                                    const enabled = isActive === '1' || isActive === 'true' || isActive === 't';

                                    return (
                                        <div className="flex items-center">
                                            <span
                                                className={enabled
                                                    ? 'inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary-dark'
                                                    : 'inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500'}
                                            >
                                                <span
                                                    className={enabled
                                                        ? 'size-2 rounded-full bg-primary-dark'
                                                        : 'size-2 rounded-full bg-red-500'}
                                                />
                                                {enabled ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex justify-end gap-2">
                                    <Tooltip title={canMutate ? 'Edit' : 'View'}>
                                        <span>
                                            <IconButton
                                                component={Link}
                                                href={`/admin/products/${product.id}`}
                                                className="!rounded-xl !border !border-primary/10 !text-text-muted hover:!bg-primary/10 hover:!text-primary-dark"
                                            >
                                                <EditRoundedIcon className="!text-lg" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title={canMutate ? 'Delete' : 'Delete permission required'}>
                                        <span>
                                            <IconButton
                                                onClick={canMutate ? () => onDeleteProduct(product) : undefined}
                                                disabled={!canMutate}
                                                className={canMutate
                                                    ? '!rounded-xl !border !border-red-100 !text-red-400 hover:!bg-red-50 hover:!text-red-500'
                                                    : '!rounded-xl !border !border-primary/10 !text-text-muted'}
                                            >
                                                <DeleteRoundedIcon className="!text-lg" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
