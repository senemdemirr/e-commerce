'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button, Chip, CircularProgress, IconButton, InputBase, Menu, MenuItem, Paper, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const PAGE_SIZE = 8;

const PRICE_OPTIONS = [
    { value: 'all', label: 'Tüm Fiyatlar' },
    { value: 'entry', label: '0 ₺ - 749 ₺' },
    { value: 'mid', label: '750 ₺ - 1.499 ₺' },
    { value: 'upper', label: '1.500 ₺ - 2.999 ₺' },
    { value: 'premium', label: '3.000 ₺ ve üzeri' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'score_desc', label: 'Katalog Skoru' },
    { value: 'price_desc', label: 'Fiyat (Yüksekten Düşüğe)' },
    { value: 'price_asc', label: 'Fiyat (Düşükten Yükseğe)' },
    { value: 'title_asc', label: 'Ürün Adı (A-Z)' },
];

const READINESS_FILTERS = [
    { value: 'all', label: 'Tümü' },
    { value: 'ready', label: 'Vitrine Hazır' },
    { value: 'growing', label: 'Gelişiyor' },
    { value: 'missing', label: 'Eksik İçerik' },
];

function formatNumber(value) {
    return Number(value || 0).toLocaleString('tr-TR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) {
        return 'Tarih yok';
    }

    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function formatSlugLabel(value) {
    if (!value) {
        return 'Tanımsız';
    }

    return value
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function normalizeList(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }

            if (parsed && typeof parsed === 'object') {
                return Object.values(parsed).filter(Boolean);
            }
        } catch {
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }

    if (value && typeof value === 'object') {
        return Object.values(value).filter(Boolean);
    }

    return [];
}

function normalizeDetails(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            return {};
        }
    }

    return {};
}

function hasFilledValue(value) {
    if (Array.isArray(value)) {
        return value.some(hasFilledValue);
    }

    if (value && typeof value === 'object') {
        return Object.values(value).some(hasFilledValue);
    }

    return String(value || '').trim() !== '';
}

function getFilledDetailCount(details) {
    return Object.values(details).filter(hasFilledValue).length;
}

function getCatalogScore(product) {
    const descriptionLength = product.description?.trim().length || 0;
    const detailCount = getFilledDetailCount(product.details);

    let score = 0;

    if (product.image) score += 28;
    if (product.brand) score += 12;

    if (descriptionLength >= 120) {
        score += 22;
    } else if (descriptionLength >= 60) {
        score += 16;
    } else if (descriptionLength > 0) {
        score += 8;
    }

    if (product.colors.length > 0) score += 12;
    if (product.sizes.length > 0) score += 12;

    if (detailCount >= 3) {
        score += 14;
    } else if (detailCount > 0) {
        score += 8;
    }

    return Math.min(100, score);
}

function getReadinessMeta(score) {
    if (score >= 78) {
        return {
            value: 'ready',
            label: 'Vitrine Hazır',
            meterClassName: 'bg-primary',
        };
    }

    if (score >= 50) {
        return {
            value: 'growing',
            label: 'Gelişiyor',
            meterClassName: 'bg-accent',
        };
    }

    return {
        value: 'missing',
        label: 'Eksik İçerik',
        meterClassName: 'bg-red-500',
    };
}

function getPriceBand(price) {
    const numericPrice = Number(price || 0);

    if (numericPrice >= 3000) {
        return {
            label: 'Premium',
            chipClassName: '!bg-text-main !text-white',
        };
    }

    if (numericPrice >= 1500) {
        return {
            label: 'Yüksek',
            chipClassName: '!bg-accent/20 !text-text-main',
        };
    }

    if (numericPrice >= 750) {
        return {
            label: 'Orta',
            chipClassName: '!bg-secondary/20 !text-text-main',
        };
    }

    return {
        label: 'Giriş',
        chipClassName: '!bg-background-light !text-text-muted',
    };
}

function matchesPriceRange(price, range) {
    const numericPrice = Number(price || 0);

    if (range === 'entry') return numericPrice < 750;
    if (range === 'mid') return numericPrice >= 750 && numericPrice < 1500;
    if (range === 'upper') return numericPrice >= 1500 && numericPrice < 3000;
    if (range === 'premium') return numericPrice >= 3000;

    return true;
}

function buildPaginationItems(page, totalPages) {
    if (totalPages <= 1) return [1];
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items = new Set([1, page - 1, page, page + 1, totalPages]);
    const ordered = [...items]
        .filter((item) => item >= 1 && item <= totalPages)
        .sort((first, second) => first - second);

    return ordered.flatMap((item, index) => {
        const previous = ordered[index - 1];
        if (index > 0 && item - previous > 1) {
            return ['ellipsis', item];
        }

        return [item];
    });
}

function buildCategoryLookup(categories) {
    const lookup = new Map();

    categories.forEach((category) => {
        category.subcategories?.forEach((subcategory) => {
            lookup.set(subcategory.slug, {
                categoryName: category.name,
                categorySlug: category.slug,
                subcategoryName: subcategory.name,
                subcategorySlug: subcategory.slug,
            });
        });
    });

    return lookup;
}

function exportProductsToCsv(products) {
    const headers = [
        'ID',
        'Urun',
        'Marka',
        'Kategori',
        'Alt Kategori',
        'SKU',
        'Fiyat',
        'Katalog Skoru',
        'Durum',
    ];

    const rows = products.map((product) => [
        product.id,
        product.title,
        product.brand || '',
        product.categoryName,
        product.subcategoryName,
        product.sku || '',
        Number(product.price || 0).toFixed(2),
        product.catalogScore,
        product.readiness.label,
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'products-catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function FilterMenuButton({
    label,
    valueLabel,
    options,
    anchorEl,
    open,
    onOpen,
    onClose,
    onSelect,
}) {
    return (
        <>
            <Button
                onClick={onOpen}
                endIcon={<KeyboardArrowDownRoundedIcon />}
                className="!rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-primary/10"
            >
                <span className="text-text-muted">{label}:</span>
                <span className="ml-1">{valueLabel}</span>
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                PaperProps={{
                    className: '!mt-2 !rounded-2xl !border !border-primary/10 !bg-white !p-1 !shadow-xl !shadow-primary/10',
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.selected}
                        onClick={() => {
                            onSelect(option.value);
                            onClose();
                        }}
                        className="!mx-1 !my-0.5 !rounded-xl !px-4 !py-2.5 !text-sm !text-text-main"
                    >
                        <span>{option.label}</span>
                        {typeof option.count === 'number' ? (
                            <span className="ml-3 text-xs font-semibold text-text-muted">
                                {formatNumber(option.count)}
                            </span>
                        ) : null}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

function SummaryCard({ title, value, caption, detail, icon: Icon, iconClassName, glowClassName }) {
    return (
        <Paper className="group !relative !overflow-hidden !rounded-[28px] !border !border-primary/10 !bg-white !p-6 !shadow-sm">
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-text-muted">{title}</p>
                    <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-text-main">{value}</h2>
                    <p className="mt-3 inline-flex rounded-full bg-background-light px-3 py-1 text-xs font-semibold text-text-muted">
                        {caption}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-text-muted">{detail}</p>
                </div>

                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
                    <Icon />
                </div>
            </div>
        </Paper>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [subcategoryFilter, setSubcategoryFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [readinessFilter, setReadinessFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [menuState, setMenuState] = useState({ key: '', anchorEl: null });
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        let active = true;

        async function loadCatalog() {
            try {
                setLoading(true);
                setLoadError('');

                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories').catch(() => null),
                ]);

                if (!productsResponse.ok) {
                    throw new Error('Ürünler yüklenemedi.');
                }

                const nextProducts = await productsResponse.json();
                let nextCategories = [];

                if (categoriesResponse?.ok) {
                    nextCategories = await categoriesResponse.json();
                }

                if (!active) {
                    return;
                }

                setProducts(Array.isArray(nextProducts) ? nextProducts : []);
                setCategories(Array.isArray(nextCategories) ? nextCategories : []);
            } catch (error) {
                if (!active) {
                    return;
                }

                const message = error.message || 'Ürün kataloğu yüklenemedi.';
                setLoadError(message);
                enqueueSnackbar(message, { variant: 'error' });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCatalog();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar, refreshKey]);

    const categoryLookup = buildCategoryLookup(categories);
    const normalizedProducts = products.map((product) => {
        const colors = normalizeList(product.colors);
        const sizes = normalizeList(product.sizes);
        const details = normalizeDetails(product.details);
        const location = categoryLookup.get(product.subCategorySlug) || {};
        const categorySlug = location.categorySlug || product.categorySlug || '';
        const subcategorySlug = location.subcategorySlug || product.subCategorySlug || '';
        const categoryName = location.categoryName || formatSlugLabel(categorySlug);
        const subcategoryName = location.subcategoryName || formatSlugLabel(subcategorySlug);
        const catalogScore = getCatalogScore({
            ...product,
            colors,
            sizes,
            details,
        });
        const readiness = getReadinessMeta(catalogScore);
        const priceBand = getPriceBand(product.price);

        return {
            ...product,
            colors,
            sizes,
            details,
            categorySlug,
            subcategorySlug,
            categoryName,
            subcategoryName,
            catalogScore,
            readiness,
            priceBand,
            detailCount: getFilledDetailCount(details),
            colorCount: colors.length,
            sizeCount: sizes.length,
            descriptionLength: product.description?.trim().length || 0,
            isFresh: Boolean(product.created_at) && (Date.now() - new Date(product.created_at).getTime()) < 1000 * 60 * 60 * 24 * 30,
            publicHref: categorySlug && subcategorySlug && product.sku
                ? `/${categorySlug}/${subcategorySlug}/${product.sku}`
                : '',
        };
    });

    const categoryOptions = [{ value: 'all', label: 'Tüm Kategoriler', count: normalizedProducts.length }];
    const seenCategories = new Set();

    normalizedProducts.forEach((product) => {
        if (!product.categorySlug || seenCategories.has(product.categorySlug)) {
            return;
        }

        const count = normalizedProducts.filter((item) => item.categorySlug === product.categorySlug).length;
        categoryOptions.push({
            value: product.categorySlug,
            label: product.categoryName,
            count,
        });
        seenCategories.add(product.categorySlug);
    });

    const subcategoryOptions = [{ value: 'all', label: 'Tüm Alt Kategoriler', count: normalizedProducts.length }];
    const seenSubcategories = new Set();

    normalizedProducts.forEach((product) => {
        if (!product.subcategorySlug || seenSubcategories.has(product.subcategorySlug)) {
            return;
        }

        if (categoryFilter !== 'all' && product.categorySlug !== categoryFilter) {
            return;
        }

        const count = normalizedProducts.filter((item) => item.subcategorySlug === product.subcategorySlug).length;
        subcategoryOptions.push({
            value: product.subcategorySlug,
            label: product.subcategoryName,
            count,
        });
        seenSubcategories.add(product.subcategorySlug);
    });
    const availableSubcategoryValues = subcategoryOptions.map((item) => item.value).join('|');

    useEffect(() => {
        setPage(1);
    }, [categoryFilter, debouncedSearch, priceFilter, readinessFilter, sortBy, subcategoryFilter]);

    useEffect(() => {
        if (subcategoryFilter !== 'all' && !availableSubcategoryValues.split('|').includes(subcategoryFilter)) {
            setSubcategoryFilter('all');
        }
    }, [availableSubcategoryValues, subcategoryFilter]);

    const query = debouncedSearch.toLocaleLowerCase('tr-TR');
    const filteredProducts = normalizedProducts.filter((product) => {
        const matchesQuery = !query || [
            product.title,
            product.sku,
            product.brand,
            product.categoryName,
            product.subcategoryName,
        ]
            .filter(Boolean)
            .some((value) => value.toLocaleLowerCase('tr-TR').includes(query));

        const matchesCategory = categoryFilter === 'all' || product.categorySlug === categoryFilter;
        const matchesSubcategory = subcategoryFilter === 'all' || product.subcategorySlug === subcategoryFilter;
        const matchesPrice = priceFilter === 'all' || matchesPriceRange(product.price, priceFilter);
        const matchesReadiness = readinessFilter === 'all' || product.readiness.value === readinessFilter;

        return matchesQuery && matchesCategory && matchesSubcategory && matchesPrice && matchesReadiness;
    });

    const sortedProducts = [...filteredProducts].sort((first, second) => {
        if (sortBy === 'price_desc') return Number(second.price || 0) - Number(first.price || 0);
        if (sortBy === 'price_asc') return Number(first.price || 0) - Number(second.price || 0);
        if (sortBy === 'score_desc') return second.catalogScore - first.catalogScore;
        if (sortBy === 'title_asc') return first.title.localeCompare(second.title, 'tr');

        const firstDate = first.created_at ? new Date(first.created_at).getTime() : 0;
        const secondDate = second.created_at ? new Date(second.created_at).getTime() : 0;
        return secondDate - firstDate;
    });

    const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const visibleProducts = sortedProducts.slice(startIndex, startIndex + PAGE_SIZE);
    const paginationItems = buildPaginationItems(safePage, totalPages);

    const readyProducts = normalizedProducts.filter((product) => product.readiness.value === 'ready').length;
    const growingProducts = normalizedProducts.filter((product) => product.readiness.value === 'growing').length;
    const missingProducts = normalizedProducts.filter((product) => product.readiness.value === 'missing').length;
    const averagePrice = normalizedProducts.length > 0
        ? normalizedProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) / normalizedProducts.length
        : 0;
    const representedCategories = new Set(normalizedProducts.map((product) => product.categorySlug).filter(Boolean)).size;
    const imageCoverage = normalizedProducts.length > 0
        ? Math.round((normalizedProducts.filter((product) => product.image).length / normalizedProducts.length) * 100)
        : 0;
    const variantCoverage = normalizedProducts.length > 0
        ? Math.round((normalizedProducts.filter((product) => product.colorCount > 0 || product.sizeCount > 0).length / normalizedProducts.length) * 100)
        : 0;
    const detailCoverage = normalizedProducts.length > 0
        ? Math.round((normalizedProducts.filter((product) => product.descriptionLength >= 60 && product.detailCount > 0).length / normalizedProducts.length) * 100)
        : 0;

    const selectedCategoryLabel = categoryOptions.find((option) => option.value === categoryFilter)?.label || 'Tüm Kategoriler';
    const selectedSubcategoryLabel = subcategoryOptions.find((option) => option.value === subcategoryFilter)?.label || 'Tüm Alt Kategoriler';
    const selectedPriceLabel = PRICE_OPTIONS.find((option) => option.value === priceFilter)?.label || 'Tüm Fiyatlar';
    const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === sortBy)?.label || 'En Yeni';

    const readinessChips = READINESS_FILTERS.map((filter) => {
        let count = sortedProducts.length;

        if (filter.value === 'ready') {
            count = filteredProducts.filter((product) => product.readiness.value === 'ready').length;
        } else if (filter.value === 'growing') {
            count = filteredProducts.filter((product) => product.readiness.value === 'growing').length;
        } else if (filter.value === 'missing') {
            count = filteredProducts.filter((product) => product.readiness.value === 'missing').length;
        }

        return { ...filter, count };
    });

    async function handleCopySku(sku) {
        if (!sku) {
            enqueueSnackbar('Bu ürün için SKU tanımlı değil.', { variant: 'warning' });
            return;
        }

        try {
            await navigator.clipboard.writeText(sku);
            enqueueSnackbar('SKU panoya kopyalandı.', { variant: 'success' });
        } catch {
            enqueueSnackbar('SKU kopyalanamadı.', { variant: 'error' });
        }
    }

    function handleExportCsv() {
        if (sortedProducts.length === 0) {
            enqueueSnackbar('Dışa aktarılacak ürün bulunamadı.', { variant: 'info' });
            return;
        }

        exportProductsToCsv(sortedProducts);
        enqueueSnackbar('Ürün listesi CSV olarak indirildi.', { variant: 'success' });
    }

    function openMenu(key, event) {
        setMenuState({
            key,
            anchorEl: event.currentTarget,
        });
    }

    function closeMenu() {
        setMenuState({ key: '', anchorEl: null });
    }

    return (
        <div className="space-y-8">
            <Paper className="!relative !overflow-hidden !rounded-[36px] !border !border-primary/10 !bg-white !shadow-sm">
                <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-secondary/20 blur-2xl" />

                <div className="flex flex-row justify-between items-center gap-6 relative  gap-8 p-6 sm:p-8 ">

                    <div className="max-w-3xl">
                        <h1 className="font-display text-3xl font-black tracking-tight text-text-main sm:text-4xl">
                            Ürün Yönetimi
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
                            Mağazadaki ürünleri tek akışta tarayın, eksik içerikleri ayıklayın ve
                            kategori dağılımını kaybetmeden kataloğu hızla temizleyin.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center justify-center">
                        <Button
                            component={Link}
                            href="/admin/products/new"
                            startIcon={<AddRoundedIcon />}
                            size='small'
                            className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white"
                        >
                            Yeni Ürün Ekle
                        </Button>

                        <Button
                            onClick={handleExportCsv}
                            startIcon={<FileDownloadOutlinedIcon />}
                            size='small'
                            className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                        >
                            CSV İndir
                        </Button>
                    </div>

                </div>
            </Paper>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Toplam Ürün"
                    value={formatNumber(normalizedProducts.length)}
                    caption={`${formatNumber(representedCategories)} kategoriye yayılıyor`}
                    detail="Katalogdaki tüm ürünler tek listede toplanır; arama ve filtreler bu havuzun üzerinde çalışır."
                    icon={Inventory2RoundedIcon}
                    iconClassName="bg-primary/15 text-primary-dark"
                    glowClassName="bg-primary/10"
                />
                <SummaryCard
                    title="Vitrine Hazır"
                    value={formatNumber(readyProducts)}
                    caption={`Katalogun %${normalizedProducts.length ? Math.round((readyProducts / normalizedProducts.length) * 100) : 0}'i hazır`}
                    detail="Görseli, temel açıklaması ve ürün varyantları güçlü olan kayıtlar burada toplanır."
                    icon={AutoAwesomeRoundedIcon}
                    iconClassName="bg-secondary/20 text-text-main"
                    glowClassName="bg-secondary/15"
                />
                <SummaryCard
                    title="Eksik İçerik"
                    value={formatNumber(missingProducts)}
                    caption={`${formatNumber(growingProducts)} ürün gelişim aşamasında`}
                    detail="Eksik görsel, zayıf açıklama veya yetersiz detay alanları yüzünden geride kalan ürünler."
                    icon={WarningAmberRoundedIcon}
                    iconClassName="bg-accent/20 text-text-main"
                    glowClassName="bg-accent/15"
                />
                <SummaryCard
                    title="Ortalama Fiyat"
                    value={formatCurrency(averagePrice)}
                    caption={`${formatNumber(sortedProducts.length)} ürün filtreye uyuyor`}
                    detail="Filtreler değiştikçe tablo anında güncellenir; ürünlerin fiyat bandı dağılımı doğrudan bu görünümden okunur."
                    icon={PaidRoundedIcon}
                    iconClassName="bg-text-main text-white"
                    glowClassName="bg-primary/10"
                />
            </div>

            <Paper className="!overflow-hidden !rounded-[32px] !border !border-primary/10 !bg-white !shadow-sm">
                <div className="border-b border-primary/10 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <Paper className="flex w-full items-center gap-3 !rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !shadow-none xl:max-w-md">
                            <SearchRoundedIcon className="text-text-muted" />
                            <InputBase
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Ürün adı, SKU, marka veya kategori ara..."
                                className="w-full text-sm text-text-main"
                                inputProps={{ 'aria-label': 'Ürün ara' }}
                            />
                        </Paper>

                        <div className="flex flex-wrap gap-3">
                            <FilterMenuButton
                                label="Kategori"
                                valueLabel={selectedCategoryLabel}
                                options={categoryOptions.map((option) => ({
                                    ...option,
                                    selected: option.value === categoryFilter,
                                }))}
                                anchorEl={menuState.anchorEl}
                                open={menuState.key === 'category'}
                                onOpen={(event) => openMenu('category', event)}
                                onClose={closeMenu}
                                onSelect={(value) => {
                                    setCategoryFilter(value);
                                    setSubcategoryFilter('all');
                                }}
                            />

                            <FilterMenuButton
                                label="Alt Kategori"
                                valueLabel={selectedSubcategoryLabel}
                                options={subcategoryOptions.map((option) => ({
                                    ...option,
                                    selected: option.value === subcategoryFilter,
                                }))}
                                anchorEl={menuState.anchorEl}
                                open={menuState.key === 'subcategory'}
                                onOpen={(event) => openMenu('subcategory', event)}
                                onClose={closeMenu}
                                onSelect={setSubcategoryFilter}
                            />

                            <FilterMenuButton
                                label="Fiyat"
                                valueLabel={selectedPriceLabel}
                                options={PRICE_OPTIONS.map((option) => ({
                                    ...option,
                                    selected: option.value === priceFilter,
                                }))}
                                anchorEl={menuState.anchorEl}
                                open={menuState.key === 'price'}
                                onOpen={(event) => openMenu('price', event)}
                                onClose={closeMenu}
                                onSelect={setPriceFilter}
                            />

                            <FilterMenuButton
                                label="Sırala"
                                valueLabel={selectedSortLabel}
                                options={SORT_OPTIONS.map((option) => ({
                                    ...option,
                                    selected: option.value === sortBy,
                                }))}
                                anchorEl={menuState.anchorEl}
                                open={menuState.key === 'sort'}
                                onOpen={(event) => openMenu('sort', event)}
                                onClose={closeMenu}
                                onSelect={setSortBy}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {readinessChips.map((filter) => (
                            <Chip
                                key={filter.value}
                                clickable
                                label={`${filter.label} (${formatNumber(filter.count)})`}
                                onClick={() => setReadinessFilter(filter.value)}
                                className={readinessFilter === filter.value
                                    ? '!rounded-xl !bg-primary !font-semibold !text-text-main'
                                    : '!rounded-xl !border !border-primary/10 !bg-background-light !font-medium !text-text-muted'}
                            />
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-[420px] items-center justify-center">
                        <CircularProgress className="!text-primary" />
                    </div>
                ) : loadError ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
                        <div className="flex size-[4.5rem] items-center justify-center rounded-[28px] bg-red-50 text-red-500">
                            <WarningAmberRoundedIcon className="!text-4xl" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-display text-2xl font-black text-text-main">Ürün kataloğu yüklenemedi</h3>
                            <p className="max-w-lg text-sm leading-6 text-text-muted">{loadError}</p>
                        </div>
                        <Button
                            onClick={() => setRefreshKey((current) => current + 1)}
                            startIcon={<RefreshRoundedIcon />}
                            className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white"
                        >
                            Tekrar Dene
                        </Button>
                    </div>
                ) : sortedProducts.length === 0 ? (
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
                ) : (
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
                                                                onClick={() => handleCopySku(product.sku)}
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
                                                onClick={() => handleCopySku(product.sku)}
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
                                {formatNumber(sortedProducts.length)} ürün içinden{' '}
                                {sortedProducts.length === 0 ? 0 : startIndex + 1}-
                                {Math.min(startIndex + PAGE_SIZE, sortedProducts.length)} arası gösteriliyor
                            </p>

                            <div className="flex items-center gap-1 self-start sm:self-auto">
                                <IconButton
                                    disabled={safePage <= 1}
                                    onClick={() => setPage(safePage - 1)}
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
                                            onClick={() => setPage(item)}
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
                                    onClick={() => setPage(safePage + 1)}
                                    className="!rounded-xl !text-text-muted disabled:!opacity-40"
                                >
                                    <KeyboardArrowRightRoundedIcon />
                                </IconButton>
                            </div>
                        </div>
                    </>
                )}
            </Paper>
        </div>
    );
}
