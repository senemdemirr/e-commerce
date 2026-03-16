import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- GET: Ürün Listeleme ---

test.todo('GET /api/admin/products - admin olmayan kullanıcı 403 alır');

test.todo('GET /api/admin/products - tüm ürünleri pagination ile döner');

test.todo('GET /api/admin/products - arama parametresi ile filtreleme yapar');

test.todo('GET /api/admin/products - kategori filtresi ile döner');

// --- POST: Ürün Oluşturma ---

test.todo('POST /api/admin/products - admin olmayan kullanıcı 403 alır');

test.todo('POST /api/admin/products - eksik zorunlu alanlarla 400 döner');

test.todo('POST /api/admin/products - geçerli verilerle ürün oluşturur ve 201 döner');

test.todo('POST /api/admin/products - duplicate SKU ile 409 döner');
