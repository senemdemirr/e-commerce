import { jest } from '@jest/globals';
import { loadFresh } from './helpers/load-module.mjs';

beforeEach(() => {
  jest.resetModules();
});

test('GET /api/categories groups subcategories under categories', async () => {
  const queryMock = jest.fn().mockResolvedValue({
    rows: [
      { category_id: 1, category_name: 'Electronics', category_slug: 'electronics', subcategory_id: 10, subcategory_name: 'Phone', subcategory_slug: 'phone' },
      { category_id: 1, category_name: 'Electronics', category_slug: 'electronics', subcategory_id: 11, subcategory_name: 'Laptop', subcategory_slug: 'laptop' },
      { category_id: 2, category_name: 'Home', category_slug: 'home', subcategory_id: null, subcategory_name: null, subcategory_slug: null },
    ],
  });

  jest.unstable_mockModule('@/lib/db', () => ({
    pool: { query: queryMock },
  }));

  const { GET } = await loadFresh('app/api/categories/route.js');
  const res = await GET();
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body).toHaveLength(2);
  expect(body[0].subcategories).toHaveLength(2);
  expect(body[1].subcategories).toHaveLength(0);
});
