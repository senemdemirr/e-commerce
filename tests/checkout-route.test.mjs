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

test('POST /api/checkout returns 400 when variant stock is lower than requested quantity', async () => {
  const queryMock = jest.fn()
    .mockResolvedValueOnce({
      rows: [{
        id: 1,
        recipient_first_name: 'Jane',
        recipient_last_name: 'Doe',
        recipient_phone: '+905551112233',
        address_line: 'Test Address',
        city_name: 'Istanbul',
        district_name: 'Kadikoy',
      }],
    })
    .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, status: 'active' }] })
    .mockResolvedValueOnce({
      rows: [{
        id: 55,
        product_id: 7,
        quantity: 3,
        unit_price: 199.9,
        title: 'Regular Fit T-Shirt',
        sku: 'M-TSHIRT-001',
        variant_id: 77,
        variant_sku: 'M-TSHIRT-001-BLACK-M',
        variant_stock: 2,
      }],
    });
  const paymentCreateMock = jest.fn();
  const getUserMock = jest.fn().mockResolvedValue({ id: 1, created_at: '2024-01-01T00:00:00.000Z' });

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/users', () => ({ getOrCreateUserFromSession: getUserMock }));
  jest.unstable_mockModule('@/lib/productSchema', () => ({ ensureProductVariantSchema: jest.fn() }));
  jest.unstable_mockModule('@/lib/paymentCards', () => ({ ensurePaymentCardSchema: jest.fn() }));
  jest.unstable_mockModule('@/lib/iyzipay', () => ({ default: { payment: { create: paymentCreateMock } } }));
  jest.unstable_mockModule('iyzipay', () => ({
    default: {
      BASKET_ITEM_TYPE: { PHYSICAL: 'PHYSICAL' },
      LOCALE: { EN: 'en', TR: 'tr' },
      CURRENCY: { TRY: 'TRY' },
      PAYMENT_CHANNEL: { WEB: 'WEB' },
      PAYMENT_GROUP: { PRODUCT: 'PRODUCT' },
    },
  }));

  const { POST } = await loadFresh('app/api/checkout/route.js');
  const req = new Request('http://localhost:3000/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      shipping_address_id: 1,
      card_holder_name: 'Jane Doe',
      card_number: '4508034508034509',
      expire_month: '12',
      expire_year: '30',
      cvc: '123',
    }),
    headers: { 'content-type': 'application/json' },
  });

  const res = await POST(req);
  const body = await res.json();

  expect(res.status).toBe(400);
  expect(body.message).toBe('Regular Fit T-Shirt only has 2 item(s) left for the selected variant.');
  expect(paymentCreateMock).not.toHaveBeenCalled();
});

test('POST /api/checkout decrements variant stock after order creation', async () => {
  const poolQueryMock = jest.fn()
    .mockResolvedValueOnce({
      rows: [{
        id: 1,
        recipient_first_name: 'Jane',
        recipient_last_name: 'Doe',
        recipient_phone: '+905551112233',
        address_line: 'Test Address',
        city_name: 'Istanbul',
        district_name: 'Kadikoy',
      }],
    })
    .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, status: 'active' }] })
    .mockResolvedValueOnce({
      rows: [{
        id: 55,
        product_id: 7,
        quantity: 2,
        unit_price: 199.9,
        selected_size: 'M',
        selected_color: 'Black',
        selected_color_hex: '#000000',
        title: 'Regular Fit T-Shirt',
        sku: 'M-TSHIRT-001',
        variant_id: 77,
        variant_sku: 'M-TSHIRT-001-BLACK-M',
        variant_stock: 5,
      }],
    });
  const clientQueryMock = jest.fn(async (sql, params) => {
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('UPDATE product_variants')) {
      return { rows: [{ id: 77, stock: 3 }], rowCount: 1 };
    }

    if (sql.includes('INSERT INTO orders')) {
      return { rows: [{ id: 501, order_number: 'ORD-1-1' }], rowCount: 1 };
    }

    if (sql.includes('INSERT INTO order_items')) {
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('DELETE FROM cart_items') || sql.includes('UPDATE carts SET status')) {
      return { rows: [], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  });
  const connectMock = jest.fn().mockResolvedValue({
    query: clientQueryMock,
    release: jest.fn(),
  });
  const paymentCreateMock = jest.fn((requestData, callback) => {
    callback(null, {
      status: 'success',
      paymentId: 'pay_1',
      conversationId: 'conv_1',
      binNumber: '450803',
      lastFourDigits: '4509',
      cardFamily: 'Visa',
      cardAssociation: 'Visa',
      cardBankName: 'Test Bank',
    });
  });
  const getUserMock = jest.fn().mockResolvedValue({
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
  });

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: poolQueryMock, connect: connectMock } }));
  jest.unstable_mockModule('@/lib/users', () => ({ getOrCreateUserFromSession: getUserMock }));
  jest.unstable_mockModule('@/lib/productSchema', () => ({ ensureProductVariantSchema: jest.fn() }));
  jest.unstable_mockModule('@/lib/paymentCards', () => ({ ensurePaymentCardSchema: jest.fn() }));
  jest.unstable_mockModule('@/lib/iyzipay', () => ({ default: { payment: { create: paymentCreateMock } } }));
  jest.unstable_mockModule('iyzipay', () => ({
    default: {
      BASKET_ITEM_TYPE: { PHYSICAL: 'PHYSICAL' },
      LOCALE: { EN: 'en', TR: 'tr' },
      CURRENCY: { TRY: 'TRY' },
      PAYMENT_CHANNEL: { WEB: 'WEB' },
      PAYMENT_GROUP: { PRODUCT: 'PRODUCT' },
    },
  }));

  const { POST } = await loadFresh('app/api/checkout/route.js');
  const req = new Request('http://localhost:3000/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      shipping_address_id: 1,
      card_holder_name: 'Jane Doe',
      card_number: '4508034508034509',
      expire_month: '12',
      expire_year: '30',
      cvc: '123',
    }),
    headers: { 'content-type': 'application/json' },
  });

  const res = await POST(req);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.message).toBe('Order placed successfully');
  expect(clientQueryMock).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE product_variants'),
    [2, 77]
  );
});
