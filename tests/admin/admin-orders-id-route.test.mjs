import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Sipariş Detayı ---

test.todo('GET /api/admin/orders/[orderNumber] - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/orders/[orderNumber] - sipariş detayını ürünleriyle döner');

test.todo('GET /api/admin/orders/[orderNumber] - olmayan sipariş için 404 döner');

// --- PATCH: Sipariş Durumu Güncelleme ---

test.todo('PATCH /api/admin/orders/[orderNumber] - admin olmayan kullanıcı 403 alır');

test.todo('PATCH /api/admin/orders/[orderNumber] - geçerli durum ile günceller');

test.todo('PATCH /api/admin/orders/[orderNumber] - geçersiz durum kodu ile 400 döner');
