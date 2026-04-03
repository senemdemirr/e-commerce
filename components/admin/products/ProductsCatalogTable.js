import { Chip, IconButton, Tooltip } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { formatCurrency, formatDate } from './productsPageHelpers';

export default function ProductsCatalogTable({ visibleProducts, onCopySku }) {
    return (
        <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-primary/10 bg-background-light">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Ürün
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Kategori
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Alt Kategori
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            SKU
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Fiyat
                        </th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            Durum
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                            İşlemler
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
                                                    Yeni
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
                                                {product.colorCount} renk • {product.sizeCount} beden • {product.detailCount} detay alanı
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-text-muted">
                                            Eklendi: {formatDate(product.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <span className="inline-flex rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-text-main">
                                        {product.categoryName}
                                    </span>
                                    <p className="text-xs font-mono text-text-muted">/{product.categorySlug || 'kategori-yok'}</p>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <span className="inline-flex rounded-full bg-background-light px-3 py-1 text-xs font-semibold text-text-main">
                                        {product.subcategoryName}
                                    </span>
                                    <p className="text-xs font-mono text-text-muted">
                                        /{product.categorySlug || 'kategori'}/{product.subcategorySlug || 'alt-kategori'}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <span className="font-mono text-xs font-black text-text-main">
                                    {product.sku || 'Tanımsız'}
                                </span>
                            </td>

                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-text-main">
                                        {formatCurrency(product.price)}
                                    </p>
                                    <Chip
                                        label={product.priceBand.label}
                                        className={`!rounded-full !text-xs !font-bold ${product.priceBand.chipClassName}`}
                                    />
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
                                                {enabled ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex justify-end gap-2">
                                    <Tooltip title="Önizle">
                                        <span>
                                            <IconButton
                                                component="a"
                                                href={product.publicHref || undefined}
                                                target="_blank"
                                                rel="noreferrer"
                                                disabled={!product.publicHref}
                                                className="!rounded-xl !border !border-primary/10 !text-text-muted hover:!bg-primary/10 hover:!text-primary-dark"
                                            >
                                                <OpenInNewRoundedIcon className="!text-lg" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="SKU kopyala">
                                        <span>
                                            <IconButton
                                                onClick={() => onCopySku(product.sku)}
                                                disabled={!product.sku}
                                                className="!rounded-xl !border !border-primary/10 !text-text-muted hover:!bg-background-light hover:!text-text-main"
                                            >
                                                <ContentCopyRoundedIcon className="!text-lg" />
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
