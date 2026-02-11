import { jest } from '@jest/globals';
import { loadFresh } from './helpers/load-module.mjs';

beforeEach(() => {
  jest.resetModules();
});

test('POST /api/cart returns 401 for unauthorized user', async () => {
  const queryMock = jest.fn();
  const getUserMock = jest.fn().mockResolvedValue({});

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/users', () => ({ getOrCreateUserFromSession: getUserMock }));

  const { POST } = await loadFresh('app/api/cart/route.js');
  const req = new Request('http://localhost:3000/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productSku: 'SKU1', quantity: 1 }),
    headers: { 'content-type': 'application/json' },
  });

  const res = await POST(req);
  expect(res.status).toBe(401);
});

test('PUT /api/cart rejects invalid quantity', async () => {
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce({ rows: [{ id: 5 }] });
  const getUserMock = jest.fn().mockResolvedValue({ id: 1 });

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/users', () => ({ getOrCreateUserFromSession: getUserMock }));

  const { PUT } = await loadFresh('app/api/cart/route.js');
  const req = new Request('http://localhost:3000/api/cart', {
    method: 'PUT',
    body: JSON.stringify({ itemId: 1, quantity: 0 }),
    headers: { 'content-type': 'application/json' },
  });

  const res = await PUT(req);
  const body = await res.json();

  expect(res.status).toBe(400);
  expect(body.message).toBe('Quantity must be at least 1');
});
