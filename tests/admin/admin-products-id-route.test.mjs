import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Tekil Ürün ---

test.todo('GET /api/admin/products/[id] - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/products/[id] - mevcut ürünü döner');

test.todo('GET /api/admin/products/[id] - olmayan ürün için 404 döner');

// --- PUT: Ürün Güncelleme ---

test.todo('PUT /api/admin/products/[id] - admin olmayan kullanıcı 403 alır');

test.todo('PUT /api/admin/products/[id] - geçerli verilerle ürünü günceller');

test.todo('PUT /api/admin/products/[id] - eksik alanlarla 400 döner');

test.todo('PUT /api/admin/products/[id] - olmayan ürün için 404 döner');

// --- DELETE: Ürün Silme ---

test.todo('DELETE /api/admin/products/[id] - admin olmayan kullanıcı 403 alır');

test.todo('DELETE /api/admin/products/[id] - mevcut ürünü siler ve 200 döner');

test.todo('DELETE /api/admin/products/[id] - olmayan ürün için 404 döner');
