export const DEFAULT_PRODUCT_SORT = "featured";

export const PRODUCT_SORT_OPTIONS = [
    { value: DEFAULT_PRODUCT_SORT, label: "Featured" },
    { value: "newest", label: "Newest products" },
    { value: "price_asc", label: "Price: Low to high" },
    { value: "price_desc", label: "Price: High to low" },
    { value: "most_reviewed", label: "Most reviewed" },
    { value: "rating_desc", label: "Highest rated" },
    { value: "name_asc", label: "Name: A-Z" },
];

const PRODUCT_SORT_VALUES = new Set(PRODUCT_SORT_OPTIONS.map((option) => option.value));

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function toTimestamp(value) {
    const timestamp = new Date(value || 0).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getReviewCount(product) {
    if (Object.prototype.hasOwnProperty.call(product || {}, "review_count")) {
        return toNumber(product.review_count);
    }

    return Array.isArray(product?.reviews) ? product.reviews.length : 0;
}

function getAverageRating(product) {
    if (Object.prototype.hasOwnProperty.call(product || {}, "average_rating")) {
        return toNumber(product.average_rating);
    }

    if (!Array.isArray(product?.reviews) || product.reviews.length === 0) {
        return 0;
    }

    const total = product.reviews.reduce((sum, review) => sum + toNumber(review?.rating), 0);
    return total / product.reviews.length;
}

function compareText(left, right) {
    return String(left || "").localeCompare(String(right || ""), "tr-TR", {
        sensitivity: "base",
    });
}

function newestFirst(left, right) {
    return toTimestamp(right.product?.created_at) - toTimestamp(left.product?.created_at);
}

function idDesc(left, right) {
    return toNumber(right.product?.id) - toNumber(left.product?.id);
}

function stableOrder(left, right) {
    return left.index - right.index;
}

function defaultTieBreaker(left, right) {
    return newestFirst(left, right) || idDesc(left, right) || stableOrder(left, right);
}

export function getProductSortValue(value) {
    return PRODUCT_SORT_VALUES.has(value) ? value : DEFAULT_PRODUCT_SORT;
}

export function sortProductList(products, sortValue = DEFAULT_PRODUCT_SORT) {
    if (!Array.isArray(products)) {
        return [];
    }

    const normalizedSort = getProductSortValue(sortValue);
    const indexedProducts = products.map((product, index) => ({ product, index }));

    if (normalizedSort === DEFAULT_PRODUCT_SORT) {
        return indexedProducts.map((item) => item.product);
    }

    return indexedProducts
        .sort((left, right) => {
            if (normalizedSort === "newest") {
                return defaultTieBreaker(left, right);
            }

            if (normalizedSort === "price_asc") {
                return (
                    toNumber(left.product?.price) - toNumber(right.product?.price)
                    || defaultTieBreaker(left, right)
                );
            }

            if (normalizedSort === "price_desc") {
                return (
                    toNumber(right.product?.price) - toNumber(left.product?.price)
                    || defaultTieBreaker(left, right)
                );
            }

            if (normalizedSort === "most_reviewed") {
                return (
                    getReviewCount(right.product) - getReviewCount(left.product)
                    || getAverageRating(right.product) - getAverageRating(left.product)
                    || defaultTieBreaker(left, right)
                );
            }

            if (normalizedSort === "rating_desc") {
                return (
                    getAverageRating(right.product) - getAverageRating(left.product)
                    || getReviewCount(right.product) - getReviewCount(left.product)
                    || defaultTieBreaker(left, right)
                );
            }

            if (normalizedSort === "name_asc") {
                return (
                    compareText(left.product?.title, right.product?.title)
                    || defaultTieBreaker(left, right)
                );
            }

            return stableOrder(left, right);
        })
        .map((item) => item.product);
}
