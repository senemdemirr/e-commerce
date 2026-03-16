import { jest } from '@jest/globals';
import { loadFresh } from '../helpers/load-module.mjs';

beforeEach(() => {
    jest.resetModules();
});

// --- PUT: Alt Kategori Güncelleme ---

test.todo('PUT /api/admin/subcategories/[id] - admin olmayan kullanıcı 403 alır');

test.todo('PUT /api/admin/subcategories/[id] - geçerli verilerle alt kategoriyi günceller');

test.todo('PUT /api/admin/subcategories/[id] - olmayan alt kategori için 404 döner');

// --- DELETE: Alt Kategori Silme ---

test.todo('DELETE /api/admin/subcategories/[id] - admin olmayan kullanıcı 403 alır');

test.todo('DELETE /api/admin/subcategories/[id] - mevcut alt kategoriyi siler ve 200 döner');

test.todo('DELETE /api/admin/subcategories/[id] - olmayan alt kategori için 404 döner');

test.todo('DELETE /api/admin/subcategories/[id] - ürünü olan alt kategoriyi silmeye çalışırsa 400 döner');
