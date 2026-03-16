import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- Dashboard API Testleri ---

test.todo('GET /api/admin/dashboard - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/dashboard - toplam sipariş sayısını döner');

test.todo('GET /api/admin/dashboard - toplam geliri döner');

test.todo('GET /api/admin/dashboard - toplam müşteri sayısını döner');

test.todo('GET /api/admin/dashboard - toplam ürün sayısını döner');

test.todo('GET /api/admin/dashboard - son siparişleri döner');
