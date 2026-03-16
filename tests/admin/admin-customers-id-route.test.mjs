import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Müşteri Detayı ---

test.todo('GET /api/admin/customers/[id] - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/customers/[id] - müşteri detayını siparişleriyle döner');

test.todo('GET /api/admin/customers/[id] - olmayan müşteri için 404 döner');

// --- PATCH: Müşteri Güncelleme ---

test.todo('PATCH /api/admin/customers/[id] - admin olmayan kullanıcı 403 alır');

test.todo('PATCH /api/admin/customers/[id] - müşteri bilgilerini günceller');
