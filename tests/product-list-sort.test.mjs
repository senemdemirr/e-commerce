import { loadFresh } from './helpers/load-module.mjs';

test('sortProductList keeps the incoming order for featured sorting', async () => {
  const { sortProductList } = await loadFresh('lib/product-list-sort.js');
  const products = [
    { id: 1, title: 'B', price: 300 },
    { id: 2, title: 'A', price: 100 },
  ];

  expect(sortProductList(products, 'featured').map((product) => product.id)).toEqual([1, 2]);
});

test('sortProductList sorts by price in both directions', async () => {
  const { sortProductList } = await loadFresh('lib/product-list-sort.js');
  const products = [
    { id: 1, title: 'B', price: 300 },
    { id: 2, title: 'A', price: '100' },
    { id: 3, title: 'C', price: 200 },
  ];

  expect(sortProductList(products, 'price_asc').map((product) => product.id)).toEqual([2, 3, 1]);
  expect(sortProductList(products, 'price_desc').map((product) => product.id)).toEqual([1, 3, 2]);
});

test('sortProductList ranks most reviewed products before higher-rated ties', async () => {
  const { sortProductList } = await loadFresh('lib/product-list-sort.js');
  const products = [
    { id: 1, title: 'Few reviews', review_count: 2, average_rating: 5 },
    { id: 2, title: 'Many reviews', review_count: 10, average_rating: 3 },
    { id: 3, title: 'Best tie', review_count: 10, average_rating: 4 },
  ];

  expect(sortProductList(products, 'most_reviewed').map((product) => product.id)).toEqual([3, 2, 1]);
});

test('getProductSortValue falls back to featured for unknown values', async () => {
  const { DEFAULT_PRODUCT_SORT, getProductSortValue } = await loadFresh('lib/product-list-sort.js');

  expect(getProductSortValue('unknown')).toBe(DEFAULT_PRODUCT_SORT);
});
