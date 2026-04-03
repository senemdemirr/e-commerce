import {
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
    formatCurrency,
    formatDate,
    formatNumber,
    PAGE_SIZE,
} from './productsPageHelpers';

export default function ProductsCatalogContent({
    loading,
    loadError,
    visibleProducts,
    totalCount,
    startIndex,
    safePage,
    totalPages,
    paginationItems,
    onPageChange,
    onRetry,
    onCopySku,
}) {
    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <CircularProgress className="!text-primary" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="flex size-[4.5rem] items-center justify-center rounded-[28px] bg-red-50 text-red-500">
                    <WarningAmberRoundedIcon className="!text-4xl" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-display text-2xl font-black text-text-main">Ürün kataloğu yüklenemedi</h3>
                    <p className="max-w-lg text-sm leading-6 text-text-muted">{loadError}</p>
                </div>
                <Button
                    onClick={onRetry}
                    startIcon={<RefreshRoundedIcon />}
                    className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white"
                >
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    if (totalCount === 0) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="flex size-[4.5rem] items-center justify-center rounded-[28px] bg-primary/10 text-primary-dark">
                    <CollectionsRoundedIcon className="!text-4xl" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-display text-2xl font-black text-text-main">Filtrelere uyan ürün bulunamadı</h3>
                    <p className="max-w-lg text-sm leading-6 text-text-muted">
                        Arama terimini sadeleştirin ya da kategori ve fiyat filtrelerini genişleterek listeyi tekrar açın.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
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
                                Katalog Skoru
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
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-text-main">{product.catalogScore}/100</span>
                                            <span className="text-text-muted">{product.readiness.label}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-background-light">
                                            <div
                                                className={`h-full rounded-full ${product.readiness.meterClassName}`}
                                                style={{ width: `${product.catalogScore}%` }}
                                            />
                                        </div>
                                    </div>
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

            <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
                {visibleProducts.map((product) => (
                    <div
                        key={product.id}
                        className="rounded-[28px] border border-primary/10 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`relative flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl ${product.image ? 'bg-background-light' : 'bg-primary/10 text-primary-dark'}`}>
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

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-black text-text-main">{product.title}</h3>
                                    {product.isFresh ? (
                                        <span className="rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-main">
                                            Yeni
                                        </span>
                                    ) : null}
                                </div>

                                <p className="mt-2 text-xs font-mono font-bold text-text-muted">
                                    {product.sku || 'SKU yok'}
                                </p>
                                <p className="mt-3 text-lg font-black text-text-main">
                                    {formatCurrency(product.price)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <Chip
                                label={product.categoryName}
                                className="!rounded-full !bg-secondary/20 !font-semibold !text-text-main"
                            />
                            <Chip
                                label={product.subcategoryName}
                                className="!rounded-full !bg-background-light !font-semibold !text-text-main"
                            />
                            {product.brand ? (
                                <Chip
                                    label={product.brand}
                                    className="!rounded-full !bg-primary/10 !font-semibold !text-primary-dark"
                                />
                            ) : null}
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-text-muted">Katalog Skoru</span>
                                <span className="font-black text-text-main">{product.catalogScore}/100</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-background-light">
                                <div
                                    className={`h-full rounded-full ${product.readiness.meterClassName}`}
                                    style={{ width: `${product.catalogScore}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-muted">
                                    {product.colorCount} renk • {product.sizeCount} beden • {product.detailCount} detay
                                </span>
                                <span className="font-bold text-text-main">{product.readiness.label}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <span className="text-xs text-text-muted">Eklendi: {formatDate(product.created_at)}</span>

                            <div className="flex gap-2">
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
                                <IconButton
                                    onClick={() => onCopySku(product.sku)}
                                    disabled={!product.sku}
                                    className="!rounded-xl !border !border-primary/10 !text-text-muted hover:!bg-background-light hover:!text-text-main"
                                >
                                    <ContentCopyRoundedIcon className="!text-lg" />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-text-muted">
                    {formatNumber(totalCount)} ürün içinden{' '}
                    {totalCount === 0 ? 0 : startIndex + 1}-
                    {Math.min(startIndex + PAGE_SIZE, totalCount)} arası gösteriliyor
                </p>

                <div className="flex items-center gap-1 self-start sm:self-auto">
                    <IconButton
                        disabled={safePage <= 1}
                        onClick={() => onPageChange(safePage - 1)}
                        className="!rounded-xl !text-text-muted disabled:!opacity-40"
                    >
                        <KeyboardArrowLeftRoundedIcon />
                    </IconButton>

                    {paginationItems.map((item, index) => {
                        if (item === 'ellipsis') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-muted">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <Button
                                key={item}
                                onClick={() => onPageChange(item)}
                                className={safePage === item
                                    ? '!min-w-0 !rounded-xl !bg-primary !px-3 !py-2 !text-xs !font-bold !text-text-main'
                                    : '!min-w-0 !rounded-xl !px-3 !py-2 !text-xs !font-bold !text-text-muted hover:!bg-background-light'}
                            >
                                {item}
                            </Button>
                        );
                    })}

                    <IconButton
                        disabled={safePage >= totalPages}
                        onClick={() => onPageChange(safePage + 1)}
                        className="!rounded-xl !text-text-muted disabled:!opacity-40"
                    >
                        <KeyboardArrowRightRoundedIcon />
                    </IconButton>
                </div>
            </div>
        </>
    );
}
