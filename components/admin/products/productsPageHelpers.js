export const PAGE_SIZE = 8;

export const PRICE_OPTIONS = [
    { value: 'all', label: 'All Prices' },
    { value: 'entry', label: 'TRY 0 - TRY 749' },
    { value: 'mid', label: 'TRY 750 - TRY 1,499' },
    { value: 'upper', label: 'TRY 1,500 - TRY 2,999' },
    { value: 'premium', label: 'TRY 3,000+' },
];

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'score_desc', label: 'Catalog Score' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'title_asc', label: 'Product Name (A-Z)' },
];

export const READINESS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'ready', label: 'Storefront Ready' },
    { value: 'growing', label: 'In Progress' },
    { value: 'missing', label: 'Missing Content' },
];

export function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

export function formatDate(value) {
    if (!value) {
        return 'No date';
    }

    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export function formatSlugLabel(value) {
    if (!value) {
        return 'Unspecified';
    }

    return value
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function normalizeList(value) {
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

export function normalizeDetails(value) {
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

export function getFilledDetailCount(details) {
    return Object.values(details).filter(hasFilledValue).length;
}

export function getCatalogScore(product) {
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

export function getReadinessMeta(score) {
    if (score >= 78) {
        return {
            value: 'ready',
            label: 'Storefront Ready',
            meterClassName: 'bg-primary',
        };
    }

    if (score >= 50) {
        return {
            value: 'growing',
            label: 'In Progress',
            meterClassName: 'bg-accent',
        };
    }

    return {
        value: 'missing',
        label: 'Missing Content',
        meterClassName: 'bg-red-500',
    };
}

export function getPriceBand(price) {
    const numericPrice = Number(price || 0);

    if (numericPrice >= 3000) {
        return {
            label: 'Premium',
            chipClassName: '!bg-text-main !text-white',
        };
    }

    if (numericPrice >= 1500) {
        return {
            label: 'High',
            chipClassName: '!bg-accent/20 !text-text-main',
        };
    }

    if (numericPrice >= 750) {
        return {
            label: 'Mid',
            chipClassName: '!bg-secondary/20 !text-text-main',
        };
    }

    return {
        label: 'Entry',
        chipClassName: '!bg-background-light !text-text-muted',
    };
}

export function matchesPriceRange(price, range) {
    const numericPrice = Number(price || 0);

    if (range === 'entry') return numericPrice < 750;
    if (range === 'mid') return numericPrice >= 750 && numericPrice < 1500;
    if (range === 'upper') return numericPrice >= 1500 && numericPrice < 3000;
    if (range === 'premium') return numericPrice >= 3000;

    return true;
}

export function buildPaginationItems(page, totalPages) {
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

export function buildCategoryLookup(categories) {
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

export function exportProductsToCsv(products) {
    const headers = [
        'ID',
        'Product',
        'Brand',
        'Category',
        'Subcategory',
        'SKU',
        'Price',
        'Catalog Score',
        'Status',
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
