function toTimestamp(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function countList(value) {
  return Array.isArray(value) ? value.length : 0;
}

function productRichnessScore(product) {
  const variantCount = Number(product?.variant_count || product?.variants?.length || 0);
  const colorCount = countList(product?.colors);
  const sizeCount = countList(product?.sizes);
  const materialCount = countList(product?.details?.material);
  const bulletPointCount = countList(product?.details?.bullet_point);
  const longDescriptionCount = countList(product?.details?.description_long);

  return (
    (variantCount * 4)
    + (colorCount * 2)
    + sizeCount
    + (materialCount * 2)
    + (bulletPointCount * 3)
    + (longDescriptionCount * 2)
    + (product?.description ? 1 : 0)
    + (product?.image ? 1 : 0)
  );
}

function productFreshnessScore(product) {
  const timestamp = toTimestamp(product?.created_at);

  if (!timestamp) {
    return 0;
  }

  const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  return Math.max(0, 30 - ageInDays);
}

function productShowcaseScore(product) {
  return (productRichnessScore(product) * 3) + (productFreshnessScore(product) * 2) + Math.log10(Number(product?.price || 0) + 10);
}

function productCampaignScore(product) {
  return (Math.log10(Number(product?.price || 0) + 10) * 6) + (productRichnessScore(product) * 2) + productFreshnessScore(product);
}

function productEditorialScore(product) {
  return (productRichnessScore(product) * 4) + (countList(product?.details?.bullet_point) * 2) + (countList(product?.details?.description_long) * 2) + (product?.description ? 1 : 0);
}

function sortProductsByScore(products, scoreFn) {
  return [...products].sort((left, right) => {
    const scoreDiff = scoreFn(right) - scoreFn(left);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const dateDiff = toTimestamp(right.created_at) - toTimestamp(left.created_at);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    return Number(right.id || 0) - Number(left.id || 0);
  });
}

function takeDistinctFromLists(lists, limit, excludedIds = []) {
  const excluded = new Set(excludedIds.filter(Boolean).map((value) => String(value)));
  const selected = [];

  for (const list of lists) {
    for (const product of list || []) {
      const id = String(product?.id || "");

      if (!id || excluded.has(id)) {
        continue;
      }

      excluded.add(id);
      selected.push(product);

      if (selected.length === limit) {
        return selected;
      }
    }
  }

  return selected;
}

function pickFirstDistinct(products, excludedIds = []) {
  const excluded = new Set(excludedIds.filter(Boolean).map((value) => String(value)));

  return products.find((product) => {
    const id = String(product?.id || "");
    return id && !excluded.has(id);
  }) || null;
}

export function pickHomepageProducts(products) {
  const normalizedProducts = Array.isArray(products) ? products.filter(Boolean) : [];

  if (normalizedProducts.length === 0) {
    return {
      heroProduct: null,
      campaignProduct: null,
      editorProduct: null,
      trendingProducts: [],
      arrivals: [],
    };
  }

  const recentProducts = sortProductsByScore(normalizedProducts, (product) => toTimestamp(product?.created_at));
  const showcaseProducts = sortProductsByScore(normalizedProducts, productShowcaseScore);
  const campaignProducts = sortProductsByScore(normalizedProducts, productCampaignScore);
  const editorialProducts = sortProductsByScore(normalizedProducts, productEditorialScore);

  const heroProduct = showcaseProducts[0] || recentProducts[0] || normalizedProducts[0];
  const campaignProduct = pickFirstDistinct(campaignProducts, [heroProduct?.id]) || heroProduct;
  const editorProduct =
    pickFirstDistinct(editorialProducts, [heroProduct?.id, campaignProduct?.id]) ||
    pickFirstDistinct(recentProducts, [heroProduct?.id, campaignProduct?.id]) ||
    heroProduct;

  const trendingProducts = takeDistinctFromLists(
    [showcaseProducts, recentProducts, campaignProducts],
    5,
    [heroProduct?.id, campaignProduct?.id, editorProduct?.id]
  );

  const arrivals = takeDistinctFromLists(
    [recentProducts, showcaseProducts, editorialProducts],
    5,
    [heroProduct?.id, campaignProduct?.id, editorProduct?.id, ...trendingProducts.map((product) => product.id)]
  );
  const fallbackProducts = recentProducts.slice(0, 5);

  return {
    heroProduct,
    campaignProduct,
    editorProduct,
    trendingProducts: trendingProducts.length > 0 ? trendingProducts : fallbackProducts,
    arrivals: arrivals.length > 0 ? arrivals : fallbackProducts,
  };
}

