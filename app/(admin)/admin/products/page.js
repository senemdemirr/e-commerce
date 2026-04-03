'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ProductsCatalogContent from '@/components/admin/products/ProductsCatalogContent';
import ProductsFiltersPanel from '@/components/admin/products/ProductsFiltersPanel';
import ProductsHeader from '@/components/admin/products/ProductsHeader';
import ProductsSummaryCard from '@/components/admin/products/ProductsSummaryCard';
import { PAGE_SIZE, PRICE_OPTIONS, SORT_OPTIONS,buildCategoryLookup, buildPaginationItems, exportProductsToCsv, formatNumber, formatCurrency, formatSlugLabel, getCatalogScore, getFilledDetailCount, getPriceBand, getReadinessMeta, matchesPriceRange, normalizeDetails, normalizeList } from '@/components/admin/products/productsPageHelpers';

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
    }, [categoryFilter, debouncedSearch, priceFilter, sortBy, subcategoryFilter]);

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
        return matchesQuery && matchesCategory && matchesSubcategory && matchesPrice;
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
    const selectedCategoryLabel = categoryOptions.find((option) => option.value === categoryFilter)?.label || 'Tüm Kategoriler';
    const selectedSubcategoryLabel = subcategoryOptions.find((option) => option.value === subcategoryFilter)?.label || 'Tüm Alt Kategoriler';
    const selectedPriceLabel = PRICE_OPTIONS.find((option) => option.value === priceFilter)?.label || 'Tüm Fiyatlar';
    const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === sortBy)?.label || 'En Yeni';

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

    function handleDeleteProduct(product) {
        enqueueSnackbar(
            `${product?.title || 'Ürün'} için silme akışı henüz bağlı değil.`,
            { variant: 'info' }
        );
    }

    return (
        <div className="space-y-8">
            <ProductsHeader
                onExport={handleExportCsv}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <ProductsSummaryCard
                    title="Toplam Ürün"
                    value={formatNumber(normalizedProducts.length)}
                    caption={`${formatNumber(representedCategories)} kategoriye yayılıyor`}
                    detail="Katalogdaki tüm ürünler tek listede toplanır; arama ve filtreler bu havuzun üzerinde çalışır."
                    icon={Inventory2RoundedIcon}
                    iconClassName="bg-primary/15 text-primary-dark"
                />
                <ProductsSummaryCard
                    title="Vitrine Hazır"
                    value={formatNumber(readyProducts)}
                    caption={`Katalogun %${normalizedProducts.length ? Math.round((readyProducts / normalizedProducts.length) * 100) : 0}'i hazır`}
                    detail="Görseli, temel açıklaması ve ürün varyantları güçlü olan kayıtlar burada toplanır."
                    icon={AutoAwesomeRoundedIcon}
                    iconClassName="bg-secondary/20 text-text-main"
                />
                <ProductsSummaryCard
                    title="Eksik İçerik"
                    value={formatNumber(missingProducts)}
                    caption={`${formatNumber(growingProducts)} ürün gelişim aşamasında`}
                    detail="Eksik görsel, zayıf açıklama veya yetersiz detay alanları yüzünden geride kalan ürünler."
                    icon={WarningAmberRoundedIcon}
                    iconClassName="bg-accent/20 text-text-main"
                />
                <ProductsSummaryCard
                    title="Ortalama Fiyat"
                    value={formatCurrency(averagePrice)}
                    caption={`${formatNumber(sortedProducts.length)} ürün filtreye uyuyor`}
                    detail="Filtreler değiştikçe tablo anında güncellenir; ürünlerin fiyat bandı dağılımı doğrudan bu görünümden okunur."
                    icon={PaidRoundedIcon}
                    iconClassName="bg-text-main text-white"
                />
            </div>

            <div className="overflow-hidden rounded-[32px] border border-primary/10 bg-white shadow-sm">
                <ProductsFiltersPanel
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    selectedCategoryLabel={selectedCategoryLabel}
                    categoryOptions={categoryOptions}
                    categoryFilter={categoryFilter}
                    selectedSubcategoryLabel={selectedSubcategoryLabel}
                    subcategoryOptions={subcategoryOptions}
                    subcategoryFilter={subcategoryFilter}
                    selectedPriceLabel={selectedPriceLabel}
                    priceOptions={PRICE_OPTIONS}
                    priceFilter={priceFilter}
                    selectedSortLabel={selectedSortLabel}
                    sortOptions={SORT_OPTIONS}
                    sortBy={sortBy}
                    menuState={menuState}
                    onOpenMenu={openMenu}
                    onCloseMenu={closeMenu}
                    onCategoryChange={(value) => {
                        setCategoryFilter(value);
                        setSubcategoryFilter('all');
                    }}
                    onSubcategoryChange={setSubcategoryFilter}
                    onPriceChange={setPriceFilter}
                    onSortChange={setSortBy}
                />

                <ProductsCatalogContent
                    loading={loading}
                    loadError={loadError}
                    visibleProducts={visibleProducts}
                    totalCount={sortedProducts.length}
                    startIndex={startIndex}
                    safePage={safePage}
                    totalPages={totalPages}
                    paginationItems={paginationItems}
                    onPageChange={setPage}
                    onRetry={() => setRefreshKey((current) => current + 1)}
                    onDeleteProduct={handleDeleteProduct}
                />
            </div>
        </div>
    );
}
