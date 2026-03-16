import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Müşteri Listeleme ---

test.todo('GET /api/admin/customers - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/customers - tüm müşterileri pagination ile döner');

test.todo('GET /api/admin/customers - arama parametresi ile filtreleme yapar');
