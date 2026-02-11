import { jest } from '@jest/globals';
import { loadFresh } from './helpers/load-module.mjs';

beforeEach(() => {
  jest.resetModules();
});

test('GET /api/products returns rows from db', async () => {
  const rows = [{ id: 1, title: 'Product 1' }];
  const queryMock = jest.fn().mockResolvedValue({ rows });

  jest.unstable_mockModule('@/lib/db', () => ({
    pool: { query: queryMock },
  }));

  const { GET } = await loadFresh('app/api/products/route.js');
  const req = new Request('http://localhost:3000/api/products?category=men&subcategory=shirts');
  const res = await GET(req);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body).toEqual(rows);
  expect(queryMock).toHaveBeenCalledTimes(1);
});
