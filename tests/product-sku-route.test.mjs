import { jest } from '@jest/globals';
import { loadFresh } from './helpers/load-module.mjs';

beforeEach(() => {
  jest.resetModules();
});

test('GET /api/products/[sku] returns 204 for *.json sku', async () => {
  const queryMock = jest.fn();
  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));

  const { GET } = await loadFresh('app/api/products/[sku]/route.js');
  const res = await GET(new Request('http://localhost:3000/api/products/test.json'), { params: { sku: 'test.json' } });

  expect(res.status).toBe(204);
});

test('GET /api/products/[sku] returns 404 when product not found', async () => {
  const queryMock = jest.fn().mockResolvedValueOnce({ rows: [] });
  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));

  const { GET } = await loadFresh('app/api/products/[sku]/route.js');
  const res = await GET(new Request('http://localhost:3000/api/products/abc'), { params: { sku: 'abc' } });
  const body = await res.json();

  expect(res.status).toBe(404);
  expect(body.message).toBe('Product not found');
});

test('GET /api/products/[sku] returns product with computed review stats', async () => {
  let callIndex = 0;
  const queryMock = jest.fn().mockImplementation(async () => {
    if (callIndex === 0) {
      callIndex += 1;
      return { rows: [{ id: 99, title: 'X', sku: 'sku-1' }] };
    }
    return { rows: [{ rating: 4 }, { rating: 5 }] };
  });
  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));

  const { GET } = await loadFresh('app/api/products/[sku]/route.js');
  const res = await GET(new Request('http://localhost:3000/api/products/sku-1'), { params: { sku: 'sku-1' } });
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.review_count).toBe(2);
  expect(body.average_rating).toBe(4.5);
});
