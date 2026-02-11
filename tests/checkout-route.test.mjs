import { jest } from '@jest/globals';
import { loadFresh } from './helpers/load-module.mjs';

beforeEach(() => {
  jest.resetModules();
});

test('POST /api/checkout returns 401 for unauthorized user', async () => {
  const queryMock = jest.fn();
  const getUserMock = jest.fn().mockResolvedValue({});

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/users', () => ({ getOrCreateUserFromSession: getUserMock }));
  jest.unstable_mockModule('@/lib/iyzipay', () => ({ default: { payment: { create: jest.fn() } } }));
  jest.unstable_mockModule('iyzipay', () => ({
    default: {
      BASKET_ITEM_TYPE: { PHYSICAL: 'PHYSICAL' },
      LOCALE: { EN: 'en' },
      CURRENCY: { TRY: 'TRY' },
      PAYMENT_CHANNEL: { WEB: 'WEB' },
      PAYMENT_GROUP: { PRODUCT: 'PRODUCT' },
    },
  }));

  const { POST } = await loadFresh('app/api/checkout/route.js');
  const req = new Request('http://localhost:3000/api/checkout', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'content-type': 'application/json' },
  });

  const res = await POST(req);
  expect(res.status).toBe(401);
});

test('POST /api/checkout validates required payment fields', async () => {
  const queryMock = jest.fn();
  const getUserMock = jest.fn().mockResolvedValue({ id: 1 });

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/users', () => ({ getOrCreateUserFromSession: getUserMock }));
  jest.unstable_mockModule('@/lib/iyzipay', () => ({ default: { payment: { create: jest.fn() } } }));
  jest.unstable_mockModule('iyzipay', () => ({
    default: {
      BASKET_ITEM_TYPE: { PHYSICAL: 'PHYSICAL' },
      LOCALE: { EN: 'en' },
      CURRENCY: { TRY: 'TRY' },
      PAYMENT_CHANNEL: { WEB: 'WEB' },
      PAYMENT_GROUP: { PRODUCT: 'PRODUCT' },
    },
  }));

  const { POST } = await loadFresh('app/api/checkout/route.js');
  const req = new Request('http://localhost:3000/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ shipping_address_id: 1 }),
    headers: { 'content-type': 'application/json' },
  });

  const res = await POST(req);
  const body = await res.json();

  expect(res.status).toBe(400);
  expect(body.message).toBe('Missing required payment or address information');
});
